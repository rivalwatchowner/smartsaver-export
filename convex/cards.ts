import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const listAllCards = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("creditCards").collect();
  },
});

export const getUserWallet = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    const cards = [];
    for (const uc of userCards) {
      const card = await ctx.db.get(uc.cardId);
      if (card) {
        cards.push({
          ...card,
          userCardId: uc._id,
          isDefault: uc.isDefault,
          isActive: uc.isActive,
        });
      }
    }
    return cards;
  },
});

export const addCardToWallet = mutation({
  args: { cardId: v.id("creditCards") },
  returns: v.id("userCards"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("userCards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("cardId"), args.cardId))
      .first();
      
    if (existing) return existing._id;
    
    const firstCard = await ctx.db
      .query("userCards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
      
    return await ctx.db.insert("userCards", {
      userId,
      cardId: args.cardId,
      isDefault: !firstCard,
      isActive: true,
      dateAdded: Date.now(),
    });
  },
});

export const removeCardFromWallet = mutation({
  args: { userCardId: v.id("userCards") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const uc = await ctx.db.get(args.userCardId);
    if (!uc || uc.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.userCardId);
    return null;
  },
});

export const setDefaultCard = mutation({
  args: { userCardId: v.id("userCards") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const all = await ctx.db
      .query("userCards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    for (const uc of all) {
      await ctx.db.patch(uc._id, { isDefault: uc._id === args.userCardId });
    }
    return null;
  },
});

export const getBestCardForStore = query({
  args: { storeId: v.id("stores") },
  returns: v.union(v.null(), v.object({
    best: v.any(),
    all: v.array(v.any()),
    savingsVsDefault: v.number(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
      
    if (userCards.length === 0) return null;
    
    const store = await ctx.db.get(args.storeId);
    if (!store) return null;
    
    const recommendations = [];
    
    for (const uc of userCards) {
      const card = await ctx.db.get(uc.cardId);
      if (!card) continue;
      
      let rate = card.baseRate;
      
      // 1. Check Store Bonuses
      const storeBonus = card.storeBonuses?.find(b => 
        b.storeId === args.storeId || b.storeName?.toLowerCase() === store.name.toLowerCase()
      );
      if (storeBonus) rate = Math.max(rate, storeBonus.rate);
      
      // 2. Check Rotating Categories (Mock current quarter)
      const now = new Date();
      const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
      const rotating = card.rotatingCategories?.find(r => 
        r.quarter === currentQuarter && r.year === now.getFullYear()
      );
      // Logic for if store matches rotating category name
      // Simple string match for MVP
      if (rotating && store.name.toLowerCase().includes(rotating.name.toLowerCase())) {
        rate = Math.max(rate, rotating.rate);
      }
      
      const effectiveRate = rate * card.pointValueMultiplier;
      
      recommendations.push({
        cardId: card._id,
        name: card.name,
        logoUrl: card.logoUrl,
        rate,
        effectiveRate,
        isDefault: uc.isDefault,
      });
    }
    
    recommendations.sort((a, b) => b.effectiveRate - a.effectiveRate);
    
    const defaultCard = recommendations.find(r => r.isDefault) || recommendations[recommendations.length - 1];
    const bestCard = recommendations[0];
    
    return {
      best: bestCard,
      all: recommendations,
      savingsVsDefault: (bestCard.effectiveRate - defaultCard.effectiveRate) * 100, // extra back per $100
    };
  },
});

export const seedCards = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const cards = [
      {
        name: "Chase Sapphire Preferred",
        issuer: "Chase",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Chase_Sapphire_Preferred_Logo.png/640px-Chase_Sapphire_Preferred_Logo.png",
        annualFee: 95,
        baseRate: 0.01,
        categories: [{ name: "Dining", rate: 0.03 }, { name: "Travel", rate: 0.02 }],
        pointValueMultiplier: 1.25,
      },
      {
        name: "Chase Sapphire Reserve",
        issuer: "Chase",
        logoUrl: "https://logos-world.net/wp-content/uploads/2021/01/Chase-Bank-Logo.png",
        annualFee: 550,
        baseRate: 0.01,
        categories: [{ name: "Dining", rate: 0.03 }, { name: "Travel", rate: 0.03 }],
        pointValueMultiplier: 1.5,
      },
      {
        name: "Chase Freedom Flex",
        issuer: "Chase",
        logoUrl: "https://logos-world.net/wp-content/uploads/2021/01/Chase-Bank-Logo.png",
        annualFee: 0,
        baseRate: 0.01,
        categories: [{ name: "Dining", rate: 0.03 }, { name: "Drugstores", rate: 0.03 }],
        rotatingCategories: [{ quarter: 4, year: 2024, name: "Groceries", rate: 0.05 }],
        pointValueMultiplier: 1.25,
      },
      {
        name: "Amex Gold",
        issuer: "Amex",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/American_Express_logo.svg/600px-American_Express_logo.svg.png",
        annualFee: 250,
        baseRate: 0.01,
        categories: [{ name: "Dining", rate: 0.04 }, { name: "Groceries", rate: 0.04 }, { name: "Flights", rate: 0.03 }],
        pointValueMultiplier: 1.0,
      },
      {
        name: "Capital One VentureX",
        issuer: "Capital One",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Capital_One_logo.svg/1024px-Capital_One_logo.svg.png",
        annualFee: 395,
        baseRate: 0.02,
        categories: [{ name: "Hotels", rate: 0.10 }, { name: "Rental Cars", rate: 0.10 }],
        pointValueMultiplier: 1.0,
      },
      {
         name: "Target RedCard",
         issuer: "Target",
         logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Target_Corporation_logo (2018).svg/600px-Target_Corporation_logo (2018).svg.png",
         annualFee: 0,
         baseRate: 0.01,
         categories: [],
         storeBonuses: [{ storeName: "Target", rate: 0.05 }],
         pointValueMultiplier: 1.0,
      },
      {
        name: "Amazon Prime Visa",
        issuer: "Chase",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png",
        annualFee: 0,
        baseRate: 0.01,
        categories: [{ name: "Restaurants", rate: 0.02 }, { name: "Gas", rate: 0.02 }],
        storeBonuses: [{ storeName: "Amazon", rate: 0.05 }, { storeName: "Whole Foods", rate: 0.05 }],
        pointValueMultiplier: 1.0,
      }
    ];
    
    for (const c of cards) {
      const existing = await ctx.db
        .query("creditCards")
        .withIndex("by_name", (q) => q.eq("name", c.name))
        .first();
      if (!existing) {
        await ctx.db.insert("creditCards", c);
      }
    }
    return null;
  },
});
