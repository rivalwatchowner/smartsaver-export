import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const all = mutation({
  args: {},
  handler: async (ctx) => {
    // Run store seed
    await ctx.runMutation(api.stores.seed, {});
    
    // Run cards seed
    await ctx.runMutation(api.cards.seedCards, {});
    
    // Run public coupons seed
    await ctx.runMutation(api.publicCoupons.seedPublicCoupons, {});
    
    console.log("Seeding complete: Stores, Cards, and Public Coupons populated.");
  },
});
