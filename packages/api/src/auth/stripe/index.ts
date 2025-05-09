import * as dotenv from "dotenv";
import path from "path";
import { Stripe } from "stripe";


dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

export * from "@saas-foundry/api-model/auth/stripe/plans";

export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "invalid-stripe-webhook-secret";
export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "invalid-stripe-secret-key", {
  apiVersion: "2025-02-24.acacia",
});
