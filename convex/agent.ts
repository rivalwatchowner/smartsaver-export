"use node";

import { Agent, createTool } from "@convex-dev/agent";
import { components, api } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "sk-or-v1-mock-key",
});

export const couponAgent = new Agent(components.agent, {
  name: "Coupon Finder AI",
  instructions: `You are an expert coupon finder. 
    Your goal is to find the best coupons, daily deals, and member perks for specific stores.
    When asked about a store, use the 'saveCoupon' tool to store the coupons you find.
    If you don't have real-time access, provide realistic example coupons for that store.
    Always include the store name, item name, discount value, original price, and discounted price.`,
  languageModel: openrouter.chat("openai/gpt-4o-mini"),
  maxSteps: 5,
  tools: {
    saveCoupon: createTool({
      description: "Save a discovered coupon to the database",
      inputSchema: z.object({
        storeName: z.string(),
        title: z.string(),
        description: z.string(),
        discount: z.string(),
        originalPrice: z.number().optional(),
        discountedPrice: z.number().optional(),
        category: z.string(),
        expiresAt: z.string(),
      }),
      execute: async (ctx: any, args: any): Promise<string> => {
        // Find the store ID
        const store = await ctx.db
          .query("stores")
          .withSearchIndex("search_name", (q: any) => q.search("name", args.storeName))
          .first();

        if (!store) {
          return `Store '${args.storeName}' not found. Please create the store first.`;
        }

        await ctx.db.insert("coupons", {
          storeId: store._id,
          title: args.title,
          description: args.description,
          discount: args.discount,
          originalPrice: args.originalPrice,
          discountedPrice: args.discountedPrice,
          category: args.category,
          expiresAt: args.expiresAt,
        });

        return `Successfully saved coupon: ${args.title} for ${store.name}`;
      },
    }),
    savePublicCoupon: createTool({
      description: "Save a discovered public coupon to the database for all users",
      inputSchema: z.object({
        storeName: z.string().describe("Store name for store-specific coupons, or 'Manufacturer' for brand coupons"),
        isManufacturer: z.boolean().describe("Whether this is a brand coupon that works at any store"),
        brandName: z.string().optional().describe("Brand name (e.g. Tide, Pampers) for manufacturer coupons"),
        title: z.string(),
        description: z.string(),
        code: z.string(),
        discount: z.string(),
        discountAmount: z.number().optional(),
        barcode: z.string().optional(),
        expiresAt: z.string(),
        terms: z.string().optional(),
        category: z.string(),
        sourceUrl: z.string().optional(),
      }),
      execute: async (ctx: any, args: any): Promise<string> => {
        let storeId;
        if (!args.isManufacturer) {
          const store = await ctx.db
            .query("stores")
            .withSearchIndex("search_name", (q: any) => q.search("name", args.storeName))
            .first();

          if (!store) {
            return `Store '${args.storeName}' not found.`;
          }
          storeId = store._id;
        }

        await ctx.db.insert("publicCoupons", {
          storeId,
          storeName: args.isManufacturer ? "Manufacturer" : args.storeName,
          brandName: args.brandName,
          isManufacturer: args.isManufacturer,
          title: args.title,
          description: args.description,
          code: args.code,
          discount: args.discount,
          discountAmount: args.discountAmount,
          barcode: args.barcode,
          expiresAt: args.expiresAt,
          terms: args.terms,
          category: args.category,
          sourceUrl: args.sourceUrl,
          discoveredAt: Date.now(),
          isActive: true,
          verifiedCount: 0,
        });

        return `Successfully saved ${args.isManufacturer ? "manufacturer" : "store"} coupon: ${args.title}`;
      },
    }),
  },
});
