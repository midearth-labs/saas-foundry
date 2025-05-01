import * as dotenv from "dotenv";
import path from "path";
import { Stripe } from "stripe";


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

export const BASIC_PLAN = process.env.STRIPE_BASIC_PLAN_NAME || "saas-foundry-basic";
export const BASIC_PLAN_ID = process.env.STRIPE_BASIC_PLAN_ID || "invalid-stripe-basic-plan-id";
export const STANDARD_PLAN = process.env.STRIPE_STANDARD_PLAN_NAME || "saas-foundry-standard";
export const STANDARD_PLAN_ID = process.env.STRIPE_STANDARD_PLAN_ID || "invalid-stripe-standard-plan-id";
export const PRO_PLAN = process.env.STRIPE_PRO_PLAN_NAME || "saas-foundry-pro";
export const PRO_PLAN_ID = process.env.STRIPE_PRO_PLAN_ID || "invalid-stripe-pro-plan-id";

export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET! || "invalid-stripe-webhook-secret";
export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "invalid-stripe-secret-key", {
  apiVersion: "2025-02-24.acacia",
});

export const plans = [
    {
        "name": BASIC_PLAN,
        "priceId": BASIC_PLAN_ID,
    },
    {
        "name": STANDARD_PLAN,
        "priceId": STANDARD_PLAN_ID,
    },
    {
        "name": PRO_PLAN,
        "priceId": PRO_PLAN_ID,
    }
]
