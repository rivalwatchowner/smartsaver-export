"use node";
 
import { Agent, createTool } from "@convex-dev/agent";
import { components, api, internal } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
 
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "sk-or-v1-mock-key",
});
 
export const couponAgent = new Agent(components.agent, {
  name: "Coupon Finder AI",
  instructions: `You are a coupon and fuel deal finder for SmartSaver. Your job is to USE TOOLS to save coupons — NOT to talk about them.
 
CRITICAL RULES:
1. You MUST call the savePublicCoupon tool 3-5 times per request. This is REQUIRED.
2. Do NOT respond with text only. Text responses without tool calls are FAILURES.
3. Every savePublicCoupon call MUST include a sourceUrl — use the retailer's website (e.g. "https://www.target.com/c/coupons" or "https://shell.com/loyalty"). Reasonable retailer URLs are accepted.
4. NEVER use barcode "123456789012". Omit the barcode field if you don't have a real one.
5. Mix BOTH store-specific coupons AND manufacturer brand coupons. Aim for at least 1-2 manufacturer coupons per batch when relevant.
 
WHAT TO SAVE (3-5 calls per store, mix of types):
 
A) STORE COUPONS (isManufacturer: false):
- Target: Circle deals, weekly ads, app exclusives, RedCard 5% off
- Walmart: Rollbacks, Walmart+ member savings, weekly deals
- CVS/Walgreens: ExtraBucks, rewards, app coupons
- Kroger: Digital coupons, Fuel Points, weekly deals
- Best Buy: Member offers, weekly sales, open-box deals
- Gas stations: Loyalty fuel discounts (Shell Fuel Rewards, BPme, ExxonMobil Rewards+, Stripes Rewards)
- Set sourceUrl to the store's main coupons/deals page
 
B) MANUFACTURER COUPONS (isManufacturer: true) — these work at ANY store!
- Common brands: Tide, Pampers, Huggies, Charmin, Bounty, Crest, Colgate, Dove, Pantene, Tylenol, Advil, Kraft, Oreo, Cheerios, Coca-Cola, Pepsi, Gatorade
- Examples: "$1.00 off any Tide detergent", "50¢ off Pampers diapers", "$2 off Crest toothpaste"
- Set brandName to the brand (e.g. "Tide")
- Set storeName to "Manufacturer"
- Set sourceUrl to the brand's coupon page (e.g. "https://www.tide.com/en-us/offers", "https://www.pampers.com/en-us/rewards", "https://coupons.com")
- These are GOLD because they stack with store coupons
 
FUEL DEALS (gas stations only):
- Save loyalty fuel discount programs (e.g. "Save 5¢/gal with Shell Fuel Rewards")
- Use fuelDiscountCents for the cents-off-per-gallon value
- Set loyaltyProgram to the program name
- Use sourceUrl pointing to the program signup page
 
EXAMPLE GOOD CALLS:
 
✓ Store coupon:
savePublicCoupon({
  storeName: "Target", title: "Target Circle Member Deals",
  discount: "Up to 50% off", sourceUrl: "https://www.target.com/circle",
  category: "store", isManufacturer: false, code: "AUTO-APPLIED",
  expiresAt: "2026-06-15", description: "Save on weekly featured items as a Target Circle member"
})
 
✓ Manufacturer coupon (works at ANY store):
savePublicCoupon({
  storeName: "Manufacturer", brandName: "Tide", isManufacturer: true,
  title: "$1.00 off Tide Laundry Detergent", discount: "$1.00 off",
  discountAmount: 1.00, sourceUrl: "https://www.tide.com/en-us/offers",
  category: "household", code: "MFR-COUPON", expiresAt: "2026-06-30",
  description: "Save $1.00 on any Tide laundry detergent product"
})
 
✓ Fuel deal:
savePublicCoupon({
  storeName: "Shell", title: "Fuel Rewards - 5¢ off per gallon",
  discount: "5¢/gal", sourceUrl: "https://www.shell.us/motorist/loyalty-programs/fuel-rewards.html",
  fuelDiscountCents: 5, loyaltyProgram: "Shell Fuel Rewards",
  category: "gas", isManufacturer: false, code: "MEMBER",
  expiresAt: "2026-06-30", description: "Join Shell Fuel Rewards to save 5¢ per gallon"
})
 
START SAVING NOW. Do not ask for clarification. Do not explain what you will do. Just call savePublicCoupon 3-5 times.`,
  languageModel: openrouter.chat("anthropic/claude-3.5-haiku"),
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
        "REQUIRED: Save a coupon or fuel deal. You MUST call this 3-5 times per request. Mix store coupons and manufacturer brand coupons. sourceUrl required — use the retailer's or brand's main coupons/deals page.",
      inputSchema: z.object({
        storeName: z
          .string()
          .describe(
            "Store name for store-specific coupons, or 'Manufacturer' for brand coupons"
          ),
        isManufacturer: z
          .boolean()
          .describe(
            "TRUE for brand coupons that work at any store (Tide, Pampers, etc). FALSE for store-specific coupons (Target Circle, Walmart+, etc)."
          ),
        brandName: z
          .string()
          .optional()
          .describe(
            "Brand name (e.g. Tide, Pampers, Crest) for manufacturer coupons. REQUIRED when isManufacturer is true."
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
        sourceUrl: z
          .string()
          .min(1, "sourceUrl is required")
          .describe(
            "REQUIRED: A URL where this deal can be found. For store coupons use the retailer's coupons/deals page (e.g. https://www.target.com/circle). For manufacturer coupons use the brand's offers page (e.g. https://www.tide.com/en-us/offers) or https://coupons.com"
          ),
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
        console.log("[couponAgent.savePublicCoupon] execute called", {
          storeName: args.storeName,
          isManufacturer: args.isManufacturer,
          title: args.title?.slice?.(0, 80),
          hasSourceUrl: !!args.sourceUrl,
        });
        if (args.barcode === "123456789012") {
          console.warn("[couponAgent.savePublicCoupon] rejected placeholder barcode");
          return "Rejected: placeholder barcode detected. Omit the barcode field if you don't have a real one.";
        }

        if (!args.sourceUrl || args.sourceUrl.trim() === "") {
          console.warn("[couponAgent.savePublicCoupon] rejected missing sourceUrl");
          return "Rejected: sourceUrl is required.";
        }

        let storeId;
        if (!args.isManufacturer) {
          const matches = await ctx.runQuery(api.stores.list, {
            search: args.storeName,
          });
          const store = matches[0];

          if (!store) {
            console.warn("[couponAgent.savePublicCoupon] store not found", {
              storeName: args.storeName,
            });
            return `Store '${args.storeName}' not found.`;
          }
          storeId = store._id;
        }

        const row = {
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
          fuelPrice: args.fuelPrice,
          fuelType: args.fuelType,
          fuelDiscountCents: args.fuelDiscountCents,
          loyaltyProgram: args.loyaltyProgram,
        };

        try {
          const insertedId = await ctx.runMutation(
            internal.publicCoupons.savePublicCouponMutation,
            row
          );
          if (insertedId === null) {
            return `Skipped: expired coupon: ${args.title}`;
          }
          console.log("[couponAgent.savePublicCoupon] insert succeeded", {
            storeName: args.storeName,
            title: args.title?.slice?.(0, 60),
          });
          return `Successfully saved ${args.isManufacturer ? "manufacturer" : "store"} coupon: ${args.title}`;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const stack = err instanceof Error ? err.stack : undefined;
          console.error("[couponAgent.savePublicCoupon] INSERT FAILED:", err);
          console.error("[couponAgent.savePublicCoupon] message:", message);
          console.error("[couponAgent.savePublicCoupon] stack:", stack);
          try {
            console.error(
              "[couponAgent.savePublicCoupon] args were:",
              JSON.stringify(args)
            );
          } catch (stringifyErr) {
            console.error(
              "[couponAgent.savePublicCoupon] args (JSON.stringify failed):",
              stringifyErr,
              args
            );
          }
          return `Insert failed: ${message}`;
        }
      },
    }),
  },
});