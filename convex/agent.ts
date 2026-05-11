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
  // FIX #1 + #3: Tightened instructions — no invented coupons, sourceUrl required, fuel fields supported
  instructions: `You are an expert coupon and fuel deal finder for SmartSaver.

STRICT RULES — NEVER BREAK THESE:
1. NEVER invent, fabricate, or guess coupons or fuel prices. Only save deals you can verify with a real source URL.
2. Every call to savePublicCoupon MUST include a real sourceUrl (e.g. the retailer's website, a coupon aggregator page). If you cannot find a sourceUrl, do NOT call the tool.
3. Do NOT use barcode "123456789012" or any placeholder barcode. Omit the barcode field entirely if you don't have a real one.
4. If you have no verified deals for a store, return a text response saying so — do not save anything.

GENERAL COUPON DISCOVERY:
- Search for active coupons, promo codes, member perks, and daily deals.
- Prefer deals expiring in the future. Skip expired offers.
- Include discount amount, expiry date, and usage terms when available.

GAS STATION FUEL DISCOVERY:
- Look for current per-gallon fuel prices (Regular, Midgrade, Premium, Diesel).
- Look for loyalty fuel discount programs (cents off per gallon).
- Fill in fuelPrice (number, e.g. 3.459), fuelType, fuelDiscountCents, and loyaltyProgram when found.
- NEVER guess or estimate fuel prices — only save prices you found at a verifiable source.`,
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
          .withSearchIndex("search_name", (q: any) =>
            q.search("name", args.storeName)
          )
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
      description:
        "Save a verified public coupon or fuel deal to the database. sourceUrl is REQUIRED — never call this without a real source URL.",
      inputSchema: z.object({
        storeName: z
          .string()
          .describe(
            "Store name for store-specific coupons, or 'Manufacturer' for brand coupons"
          ),
        isManufacturer: z
          .boolean()
          .describe("Whether this is a brand coupon that works at any store"),
        brandName: z
          .string()
          .optional()
          .describe(
            "Brand name (e.g. Tide, Pampers) for manufacturer coupons"
          ),
        title: z.string(),
        description: z.string(),
        code: z.string(),
        discount: z.string(),
        discountAmount: z.number().optional(),
        barcode: z
          .string()
          .optional()
          .describe(
            "Real barcode only — omit if you don't have one. Never use '123456789012'."
          ),
        expiresAt: z.string(),
        terms: z.string().optional(),
        category: z.string(),
        // FIX #1: sourceUrl is now required (no longer optional)
        sourceUrl: z
          .string()
          .min(1, "sourceUrl is required")
          .describe(
            "REQUIRED: The real URL where this deal was found. Do not call this tool without it."
          ),
        // FIX #3: Fuel fields
        fuelPrice: z
          .number()
          .optional()
          .describe(
            "Current per-gallon fuel price (e.g. 3.459). Gas stations only."
          ),
        fuelType: z
          .enum(["Regular", "Midgrade", "Premium", "Diesel"])
          .optional()
          .describe("Type of fuel this price/discount applies to."),
        fuelDiscountCents: z
          .number()
          .optional()
          .describe(
            "Cents off per gallon (e.g. 5 = 5¢/gal). Gas stations only."
          ),
        loyaltyProgram: z
          .string()
          .optional()
          .describe(
            "Name of the loyalty/rewards program offering this fuel deal."
          ),
      }),
      execute: async (ctx: any, args: any): Promise<string> => {
        // FIX #1: Reject placeholder barcodes
        if (args.barcode === "123456789012") {
          return "Rejected: placeholder barcode detected. Omit the barcode field if you don't have a real one.";
        }

        // FIX #1: Require a real sourceUrl
        if (!args.sourceUrl || args.sourceUrl.trim() === "") {
          return "Rejected: sourceUrl is required. Do not save coupons without a verifiable source URL.";
        }

        let storeId;
        if (!args.isManufacturer) {
          const store = await ctx.db
            .query("stores")
            .withSearchIndex("search_name", (q: any) =>
              q.search("name", args.storeName)
            )
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
          barcode: args.barcode, // only set if real
          expiresAt: args.expiresAt,
          terms: args.terms,
          category: args.category,
          sourceUrl: args.sourceUrl,
          discoveredAt: Date.now(),
          isActive: true,
          verifiedCount: 0,
          // FIX #3: Fuel fields
          fuelPrice: args.fuelPrice,
          fuelType: args.fuelType,
          fuelDiscountCents: args.fuelDiscountCents,
          loyaltyProgram: args.loyaltyProgram,
        });

        return `Successfully saved ${args.isManufacturer ? "manufacturer" : "store"} coupon: ${args.title}`;
      },
    }),
  },
});
