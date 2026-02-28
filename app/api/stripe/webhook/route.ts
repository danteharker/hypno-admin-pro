import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin env not set");
  }
  return createClient(url, key);
}

function subscriptionStatusFromStripe(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    default:
      return "expired";
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not set" },
      { status: 500 }
    );
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = await getAdminSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        let userId =
          session.metadata?.supabase_user_id ??
          (session.client_reference_id as string);
        if (!userId && session.customer_details?.email) {
          const email = (session.customer_details.email as string).trim().toLowerCase();
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("id")
            .ilike("email", email)
            .maybeSingle();
          userId = profileByEmail?.id ?? null;
        }
        if (!userId) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        const now = new Date();
        const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

        await supabase
          .from("profiles")
          .update({
            subscription_status: "trialing",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            trial_starts_at: now.toISOString(),
            trial_ends_at: trialEndsAt,
          })
          .eq("id", userId);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId);

        if (!profiles?.length) break;

        if (event.type === "customer.subscription.deleted") {
          await supabase
            .from("profiles")
            .update({
              subscription_status: "expired",
              stripe_subscription_id: null,
            })
            .eq("id", profiles[0].id);
        } else {
          const status = subscriptionStatusFromStripe(subscription.status);
          const trialEnd = subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null;
          await supabase
            .from("profiles")
            .update({
              subscription_status: status,
              trial_ends_at: trialEnd,
            })
            .eq("id", profiles[0].id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null;
        if (!customerId) break;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId);

        if (!profiles?.length) break;

        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("id", profiles[0].id);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook error:", e);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
