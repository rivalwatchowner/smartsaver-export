"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import crypto from "crypto";

const LEMON_SQUEEZY_ENDPOINT = "https://api.lemonsqueezy.com/v1";

/** Donation preset → Convex env key (numeric Lemon Squeezy variant id). */
const donationVariantEnvKey = (preset: "5" | "10" | "15" | "25") =>
  `LEMON_SQUEEZY_VARIANT_DONATION_${preset}` as const;

function resolveDonationVariantId(args: {
  planId: string;
  donationPreset?: "5" | "10" | "15" | "25";
  customAmountCents?: number;
  variantId?: string;
}): string {
  if (args.planId !== "donation") {
    if (!args.variantId) throw new Error("variantId is required for this checkout");
    return args.variantId;
  }

  if (args.donationPreset) {
    const key = donationVariantEnvKey(args.donationPreset);
    const id = process.env[key];
    if (!id || !id.trim()) {
      throw new Error(
        `Missing Convex environment variable ${key}. Set it to the Lemon Squeezy variant id for the $${args.donationPreset} donation (Products → variant id in dashboard or API).`
      );
    }
    return id.trim();
  }

  if (args.customAmountCents != null && args.customAmountCents > 0) {
    const id = process.env.LEMON_SQUEEZY_VARIANT_DONATION_CUSTOM;
    if (!id || !id.trim()) {
      throw new Error(
        "Missing Convex environment variable LEMON_SQUEEZY_VARIANT_DONATION_CUSTOM. Set it to the Lemon Squeezy variant id used for pay-what-you-want / custom donation amounts."
      );
    }
    return id.trim();
  }

  if (args.variantId) return args.variantId;

  throw new Error(
    "Donation checkout requires donationPreset (5|10|15|25) or customAmountCents with LEMON_SQUEEZY_VARIANT_DONATION_CUSTOM set in Convex."
  );
}

export const createCheckout = action({
  args: {
    planId: v.string(),
    /** Legacy subscription checkouts; donations should use donationPreset instead. */
    variantId: v.optional(v.string()),
    donationPreset: v.optional(
      v.union(
        v.literal("5"),
        v.literal("10"),
        v.literal("15"),
        v.literal("25")
      )
    ),
    /** PWYW / custom price in cents (e.g. 750 = $7.50). Appends checkout[custom_price] to checkout URL. */
    customAmountCents: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getMe);
    if (!user) throw new Error("User not found");

    const variantId = resolveDonationVariantId({
      planId: args.planId,
      donationPreset: args.donationPreset,
      customAmountCents: args.customAmountCents,
      variantId: args.variantId,
    });

    console.log("[lemonSqueezy.createCheckout] Creating checkout", {
      planId: args.planId,
      donationPreset: args.donationPreset ?? null,
      hasCustomAmount: args.customAmountCents != null,
      variantIdSuffix: variantId.slice(-6),
    });

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
                id: variantId,
              },
            },
          },
        },
      }),
    });

    const json: any = await response.json();
    if (!response.ok) {
      const detail =
        json.errors?.[0]?.detail ||
        json.errors?.[0]?.title ||
        JSON.stringify(json.errors?.[0] ?? json);
      console.error("[lemonSqueezy.createCheckout] Lemon API error", {
        status: response.status,
        detail,
      });
      throw new Error(detail || "Failed to create checkout");
    }

    let checkoutUrl: string = json.data?.attributes?.url;
    if (!checkoutUrl || typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("http")) {
      console.error("[lemonSqueezy.createCheckout] Missing checkout URL in response", {
        hasData: !!json.data,
      });
      throw new Error("Lemon Squeezy did not return a valid checkout URL.");
    }

    // Append custom price if provided (PWYW variants)
    if (args.customAmountCents && args.customAmountCents > 0) {
      const separator = checkoutUrl.includes("?") ? "&" : "?";
      checkoutUrl = `${checkoutUrl}${separator}checkout[custom_price]=${args.customAmountCents}`;
    }

    console.log("[lemonSqueezy.createCheckout] success", {
      checkoutUrlPrefix: checkoutUrl.slice(0, 40),
    });

    return checkoutUrl;
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
          renewsAt: attributes.renews_at
            ? new Date(attributes.renews_at).getTime()
            : undefined,
          endsAt: attributes.ends_at
            ? new Date(attributes.ends_at).getTime()
            : undefined,
          trialEndsAt: attributes.trial_ends_at
            ? new Date(attributes.trial_ends_at).getTime()
            : undefined,
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
          endsAt: attributes.ends_at
            ? new Date(attributes.ends_at).getTime()
            : undefined,
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
        console.warn(`Payment failed for user ${userId}`);
        break;
      }
    }

    return { success: true };
  },
});
