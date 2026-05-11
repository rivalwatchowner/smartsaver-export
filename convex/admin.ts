import { query, mutation, internalMutation, internalAction, internalQuery, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    return user?.role === "admin" || user?.email === ADMIN_EMAIL;
  },
});

export const getDashboardStats = query({
  args: {},
  returns: v.object({
    totalRevenue: v.number(),
    donationsThisMonth: v.number(),
    averageDonation: v.number(),
    totalDonors: v.number(),
    activeSubscriptions: v.number(),
    mrr: v.number(),
    churnRate: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin" && user?.email !== ADMIN_EMAIL) throw new Error("Unauthorized");

    const payments = await ctx.db.query("payments").collect();
    
    const totalDonations = payments.reduce((acc, p) => acc + p.amount, 0);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const donationsThisMonth = payments
        .filter(p => p.createdAt >= startOfMonth)
        .reduce((acc, p) => acc + p.amount, 0);

    const uniqueDonors = new Set(payments.map(p => p.userId)).size;

    return {
      totalRevenue: totalDonations / 100,
      donationsThisMonth: donationsThisMonth / 100,
      averageDonation: uniqueDonors > 0 ? (totalDonations / uniqueDonors) / 100 : 0,
      totalDonors: uniqueDonors,
      activeSubscriptions: uniqueDonors, // Using as a proxy for "Active Supporters"
      mrr: donationsThisMonth / 100, // Using as a proxy for "Monthly Support"
      churnRate: 0, 
    };
  },
});

export const getCustomers = query({
    args: { limit: v.number() },
    returns: v.array(v.any()),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const user = await ctx.db.get(userId);
        if (user?.role !== "admin" && user?.email !== ADMIN_EMAIL) throw new Error("Unauthorized");

        return await ctx.db.query("users").take(args.limit);
    }
});

export const recordPaymentLS = internalMutation({
  args: {
    userId: v.id("users"),
    lemonSqueezyId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    planId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      ...args,
      createdAt: Date.now(),
    });
    
    // Update daily revenue snapshot
    const today = new Date().toISOString().split("T")[0];
    const snapshot = await ctx.db
      .query("revenueSnapshots")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (snapshot) {
      await ctx.db.patch(snapshot._id, {
        revenue: snapshot.revenue + args.amount,
      });
    } else {
      await ctx.db.insert("revenueSnapshots", {
        date: today,
        revenue: args.amount,
        mrr: 0, // Should be calculated properly
        activeSubscriptions: 0,
        churnedCount: 0,
        newSignups: 0,
      });
    }
    return null;
  },
});

export const logAdminAction = mutation({
    args: { action: v.string(), targetId: v.optional(v.string()), details: v.string() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const user = await ctx.db.get(userId);
        if (user?.role !== "admin" && user?.email !== ADMIN_EMAIL) throw new Error("Unauthorized");

        await ctx.db.insert("auditLogs", {
            adminId: userId,
            action: args.action,
            targetId: args.targetId,
            details: args.details,
            timestamp: Date.now(),
        });
        return null;
    }
});

export const exportRevenueCSV = action({
    args: {},
    returns: v.string(),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const user = await ctx.runQuery(api.users.getMe);
        if (user?.role !== "admin" && user?.email !== ADMIN_EMAIL) throw new Error("Unauthorized");

        const payments = await ctx.runQuery(internal.admin.getAllPayments);
        
        let csv = "Date,Amount,Currency,Status,Plan\n";
        for (const p of payments) {
            csv += `${new Date(p.createdAt).toISOString()},${p.amount / 100},${p.currency},${p.status},${p.planId}\n`;
        }
        
        return csv;
    }
});

export const seedDashboard = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        
        // Make current user admin
        await ctx.db.patch(userId, { role: "admin" });

        // Seed some payments
        const now = Date.now();
        for (let i = 0; i < 5; i++) {
            await ctx.db.insert("payments", {
                userId,
                lemonSqueezyId: `pay_${i}`,
                amount: (Math.floor(Math.random() * 5) + 1) * 100,
                currency: "usd",
                status: "succeeded",
                planId: "premium",
                createdAt: now - (i * 24 * 60 * 60 * 1000),
            });
        }

        // Seed some subscriptions
        await ctx.db.insert("subscriptions", {
            userId,
            planId: "premium",
            lemonSqueezyId: "sub_mock_123",
            status: "active",
            renewsAt: now + (30 * 24 * 60 * 60 * 1000),
        });
        return null;
    }
});

export const getAllPayments = internalQuery({
    args: {},
    returns: v.array(v.any()),
    handler: async (ctx) => {
        return await ctx.db.query("payments").collect();
    }
});
