import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const getLinkedAccounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("linkedLoyaltyAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getLinkedAccountForStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("linkedLoyaltyAccounts")
      .withIndex("by_user_and_store", (q) =>
        q.eq("userId", userId).eq("storeId", args.storeId)
      )
      .unique();
  },
});

export const linkAccount = mutation({
  args: {
    storeId: v.id("stores"),
    storeName: v.string(),
    loyaltyProgramName: v.string(),
    accountIdentifier: v.string(),
    pointsBalance: v.number(),
    cashbackBalance: v.number(),
    tier: v.optional(v.string()),
    expiringPoints: v.optional(v.number()),
    expirationDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("linkedLoyaltyAccounts")
      .withIndex("by_user_and_store", (q) =>
        q.eq("userId", userId).eq("storeId", args.storeId)
      )
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        accountIdentifier: args.accountIdentifier,
        pointsBalance: args.pointsBalance,
        cashbackBalance: args.cashbackBalance,
        tier: args.tier,
        expiringPoints: args.expiringPoints,
        expirationDate: args.expirationDate,
        lastSynced: Date.now(),
      });
    }

    return await ctx.db.insert("linkedLoyaltyAccounts", {
      userId,
      storeId: args.storeId,
      storeName: args.storeName,
      loyaltyProgramName: args.loyaltyProgramName,
      accountIdentifier: args.accountIdentifier,
      pointsBalance: args.pointsBalance,
      cashbackBalance: args.cashbackBalance,
      tier: args.tier,
      expiringPoints: args.expiringPoints,
      expirationDate: args.expirationDate,
      linkedAt: Date.now(),
      lastSynced: Date.now(),
    });
  },
});

export const unlinkAccount = mutation({
  args: { accountId: v.id("linkedLoyaltyAccounts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or access denied");
    }

    await ctx.db.delete(args.accountId);
  },
});

export const updateBalance = mutation({
  args: {
    accountId: v.id("linkedLoyaltyAccounts"),
    pointsBalance: v.number(),
    cashbackBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found or access denied");
    }

    await ctx.db.patch(args.accountId, {
      pointsBalance: args.pointsBalance,
      cashbackBalance: args.cashbackBalance,
      lastSynced: Date.now(),
    });

    const diffPoints = args.pointsBalance - account.pointsBalance;
    if (diffPoints !== 0) {
      await ctx.db.insert("loyaltyTransactions", {
        linkedAccountId: args.accountId,
        userId,
        transactionDate: Date.now(),
        pointsEarned: diffPoints > 0 ? diffPoints : 0,
        pointsRedeemed: diffPoints < 0 ? Math.abs(diffPoints) : 0,
        description: "Manual balance update",
      });
    }
  },
});
