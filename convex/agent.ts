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
  instructions: `You are an expert coupon and discount finder for the SmartSaver app.
Your goal is to find real, active coupons and deals for specific stores.

CRITICAL — when calling savePublicCoupon you MUST always provide ALL of these fields:
- storeName: the exact store name
- isManufacturer: false for store-specific coupons, true for brand/manufacturer coupons
- title: a short coupon title
- description: one sentence describing the deal
- discount: a short human-readable string like "10% Off" or "5¢ Off Per Gallon"
- code: the coupon/promo code string — if there is no code use an empty string "", never omit this field
- category: the store category such as "Grocery", "Gas", "Pharmacy", "Electronics", "General" — never omit this field
- expiresAt: expiry date in YYYY-MM-DD format — if unknown, use a date 90 days from today, never omit this field

Never omit code, category, or expiresAt. Never pass null for these fields.`,
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
        isManufacturer: z.boolean().default(false).describe("Whether this is a brand coupon that works at any store"),
        brandName: z.string().optional().describe("Brand name (e.g. Tide, Pampers) for manufacturer coupons"),
        title: z.string(),
        description: z.string(),
        code: z.string().default("").describe("Coupon/promo code string; use empty string '' if there is no code, never omit"),
        discount: z.string(),
        discountAmount: z.union([z.number(), z.string()]).optional().describe("Numeric discount amount (number only, no $ sign)"),
        barcode: z.string().optional(),
        expiresAt: z.string().default("").describe("Expiry date in YYYY-MM-DD format; use 90 days from today if unknown, never omit"),
        terms: z.string().optional(),
        category: z.string().default("General").describe("Category like 'Grocery', 'Gas', 'Pharmacy', 'General'; never omit"),
        sourceUrl: z.string().optional(),
      }),
      execute: async (ctx: any, args: any): Promise<string> => {
        console.log("[savePublicCoupon] called with args:", JSON.stringify(args));

        const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const code: string =
          args.code != null && args.code !== "" ? String(args.code) : "";

        const category: string =
          args.category != null && args.category !== ""
            ? String(args.category)
            : "General";

        const expiresAt: string =
          args.expiresAt != null && args.expiresAt !== ""
            ? String(args.expiresAt)
            : ninetyDaysFromNow;

        let discountAmount: number | undefined = undefined;
        if (args.discountAmount != null) {
          const parsed =
            typeof args.discountAmount === "number"
              ? args.discountAmount
              : parseFloat(String(args.discountAmount));
          if (!isNaN(parsed)) discountAmount = parsed;
        }

        let storeId: any = undefined;
        if (!args.isManufacturer) {
          const store = await ctx.db
            .query("stores")
            .withSearchIndex("search_name", (q: any) => q.search("name", args.storeName))
            .first();

          if (!store) {
            console.warn("[savePublicCoupon] Store not found:", args.storeName);
            return `Store '${args.storeName}' not found.`;
          }
          storeId = store._id;
        }

        try {
          await ctx.db.insert("publicCoupons", {
            storeId,
            storeName: args.isManufacturer ? "Manufacturer" : args.storeName,
            brandName: args.brandName,
            isManufacturer: args.isManufacturer ?? false,
            title: args.title,
            description: args.description,
            code,
            discount: args.discount,
            discountAmount,
            barcode: args.barcode,
            expiresAt,
            terms: args.terms,
            category,
            sourceUrl: args.sourceUrl,
            discoveredAt: Date.now(),
            isActive: true,
            verifiedCount: 0,
          });
          console.log(
            "[savePublicCoupon] insert succeeded:",
            args.title,
            "| code:", code,
            "| category:", category,
            "| expiresAt:", expiresAt
          );
          return `Successfully saved ${args.isManufacturer ? "manufacturer" : "store"} coupon: ${args.title}`;
        } catch (err: any) {
          console.error(
            "[savePublicCoupon] INSERT FAILED. Args:",
            JSON.stringify({
              storeName: args.storeName,
              title: args.title,
              code,
              category,
              expiresAt,
              discountAmount,
            }),
            "Error:",
            err?.message ?? String(err)
          );
          return `Failed to save coupon '${args.title}': ${err?.message ?? String(err)}`;
        }
      },
    }),
  },
});
