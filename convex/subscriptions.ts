import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const updateSubscriptionLS = internalMutation({
  args: {
    userId: v.id("users"),
    planId: v.string(),
    lemonSqueezyId: v.string(),
    status: v.string(),
    renewsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_lemon_squeezy_id", (q) => q.eq("lemonSqueezyId", args.lemonSqueezyId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        renewsAt: args.renewsAt,
        endsAt: args.endsAt,
        trialEndsAt: args.trialEndsAt,
      });
    } else {
      await ctx.db.insert("subscriptions", args);
    }

    const isActive = ["active", "on_trial"].includes(args.status);
    await ctx.db.patch(args.userId, { 
      plan: isActive ? args.planId : "free" 
    });
  },
});
