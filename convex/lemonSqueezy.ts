"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import crypto from "crypto";

const LEMON_SQUEEZY_ENDPOINT = "https://api.lemonsqueezy.com/v1";

export const createCheckout = action({
  args: {
    variantId: v.string(),
    planId: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getMe);
    if (!user) throw new Error("User not found");

    const response = await fetch(`${LEMON_SQUEEZY_ENDPOINT}/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                userId,
                planId: args.planId,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: process.env.LEMON_SQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: args.variantId,
              },
            },
          },
        },
      }),
    });

    const json: any = await response.json();
    if (!response.ok) {
      throw new Error(json.errors?.[0]?.detail || "Failed to create checkout");
    }

    return json.data.attributes.url as string;
  },
});

export const handleWebhook = internalAction({
  args: { body: v.string(), signature: v.string() },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const hmac = crypto.createHmac("sha256", secret || "");
    const digest = hmac.update(args.body).digest("hex");

    if (args.signature !== digest) {
      return { success: false, error: "Invalid signature" };
    }

    const payload = JSON.parse(args.body);
    const eventName = payload.meta.event_name;
    const attributes = payload.data.attributes;
    const customData = payload.meta.custom_data;

    const userId = customData?.userId as any;
    const planId = customData?.planId as string;

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        await ctx.runMutation(internal.subscriptions.updateSubscriptionLS, {
          userId,
          planId,
          lemonSqueezyId: payload.data.id,
          status: attributes.status,
          renewsAt: attributes.renews_at ? new Date(attributes.renews_at).getTime() : undefined,
          endsAt: attributes.ends_at ? new Date(attributes.ends_at).getTime() : undefined,
          trialEndsAt: attributes.trial_ends_at ? new Date(attributes.trial_ends_at).getTime() : undefined,
        });
        break;
      }
      case "subscription_cancelled":
      case "subscription_expired": {
        await ctx.runMutation(internal.subscriptions.updateSubscriptionLS, {
          userId,
          planId,
          lemonSqueezyId: payload.data.id,
          status: attributes.status,
          renewsAt: undefined,
          endsAt: attributes.ends_at ? new Date(attributes.ends_at).getTime() : undefined,
        });
        break;
      }
      case "subscription_payment_success": {
        await ctx.runMutation(internal.admin.recordPaymentLS, {
          userId,
          lemonSqueezyId: payload.data.id,
          amount: attributes.total,
          currency: attributes.currency,
          status: attributes.status,
          planId,
        });
        break;
      }
      case "subscription_payment_failed": {
        // Logic for failed payment alerts could go here
        console.warn(`Payment failed for user ${userId}`);
        break;
      }
    }

    return { success: true };
  },
});
