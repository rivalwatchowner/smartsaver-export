import { v } from "convex/values";
import { mutation, action, query, internalAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { couponAgent } from "./agent";
import { auth } from "./auth";
import type { Id } from "./_generated/dataModel";

// Helper function to group coupons by store
function groupCouponsByStore(coupons: any[], stores: any[]) {
  const grouped: Record<
    string,
    {
      storeId: string;
      store?: any;
      storeName: string;
      coupons: any[];
      isManufacturer: boolean;
    }
  > = {};

  for (const c of coupons) {
    if (c.isManufacturer) {
      if (!grouped["manufacturer"]) {
        grouped["manufacturer"] = {
          storeId: "manufacturer",
          storeName: "Brand Coupons (Stackable)",
          coupons: [],
          isManufacturer: true,
        };
      }
      grouped["manufacturer"].coupons.push(c);
    } else if (c.storeId) {
      if (!grouped[c.storeId]) {
        const store = stores.find((s) => s._id === c.storeId);
        grouped[c.storeId] = {
          storeId: c.storeId,
          store,
          storeName: store?.name || c.storeName || "Unknown",
          coupons: [],
          isManufacturer: false,
        };
      }
      grouped[c.storeId].coupons.push(c);
    }
  }

  return Object.values(grouped).sort((a, b) => {
    if (a.isManufacturer) return -1;
    if (b.isManufacturer) return 1;
    return a.storeName.localeCompare(b.storeName);
  });
}

export const listGroupedByStore = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const userState = user?.state;

    const coupons = await ctx.db
      .query("publicCoupons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter by state if coupon has state restrictions
    const stateFilteredCoupons = coupons.filter(c => {
      if (!c.states || c.states.length === 0) return true;
      if (!userState) return true; // Show all if user has no state set
      return c.states.includes(userState);
    });

    const stores = await ctx.db.query("stores").collect();
    const clipped = userId
      ? await ctx.db
          .query("clippedCoupons")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      : [];
    const clippedIds = new Set(clipped.map((c) => c.publicCouponId));

    let filtered = stateFilteredCoupons;
    if (args.search) {
      const search = args.search.toLowerCase();
      filtered = stateFilteredCoupons.filter(
        (c) =>
          (c.storeName || "").toLowerCase().includes(search) ||
          (c.title || "").toLowerCase().includes(search) ||
          (c.description || "").toLowerCase().includes(search)
      );
    }

    const couponsWithClipped = filtered.map((c) => ({
      ...c,
      isClipped: clippedIds.has(c._id),
    }));

    return groupCouponsByStore(couponsWithClipped, stores);
  },
});

export const getStoreCoupons = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const user = userId ? await ctx.db.get(userId) : null;
    const userState = user?.state;

    const storeSpecific = await ctx.db
      .query("publicCoupons")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    const manufacturers = await ctx.db
      .query("publicCoupons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("isManufacturer"), true))
      .collect();

    const allRaw = [...storeSpecific, ...manufacturers];
    
    // Filter by state
    const stateFiltered = allRaw.filter(c => {
      if (!c.states || c.states.length === 0) return true;
      if (!userState) return true;
      return c.states.includes(userState);
    });

    const clipped = userId
      ? await ctx.db
          .query("clippedCoupons")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      : [];
    const clippedIds = new Set(clipped.map((c) => c.publicCouponId));

    const all = stateFiltered.map((c) => ({
      ...c,
      isClipped: clippedIds.has(c._id),
    }));

    return all.sort((a, b) =>
      a.isManufacturer === b.isManufacturer ? 0 : a.isManufacturer ? 1 : -1
    );
  },
});

export const listClippedGroupedByStore = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const clipped = await ctx.db
      .query("clippedCoupons")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stores = await ctx.db.query("stores").collect();
    const coupons = [];

    for (const c of clipped) {
      const coupon = await ctx.db.get(c.publicCouponId);
      if (coupon && coupon.isActive) {
        coupons.push({ ...coupon, isClipped: true });
      }
    }

    return groupCouponsByStore(coupons, stores);
  },
});

export const clipCoupon = mutation({
  args: { couponId: v.id("publicCoupons") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("clippedCoupons")
      .withIndex("by_user_and_coupon", (q) =>
        q.eq("userId", userId).eq("publicCouponId", args.couponId)
      )
      .first();
    if (!existing) {
      await ctx.db.insert("clippedCoupons", {
        userId,
        publicCouponId: args.couponId,
        clippedAt: Date.now(),
        used: false,
      });
    }
  },
});

export const unclipCoupon = mutation({
  args: { couponId: v.id("publicCoupons") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("clippedCoupons")
      .withIndex("by_user_and_coupon", (q) =>
        q.eq("userId", userId).eq("publicCouponId", args.couponId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const discoverAllStoreCoupons = internalAction({
  args: { tier: v.number() },
  handler: async (ctx, args) => {
    const stores = await ctx.runQuery(api.stores.list, {});
    const tier1 = [
      "Target",
      "Walmart",
      "Kroger",
      "Safeway",
      "Whole Foods",
      "Costco",
      "Sam's Club",
      "Aldi",
      "Trader Joe's",
      "Publix",
      "CVS",
      "Walgreens",
      "Shell",
      "ExxonMobil",
      "BP",
      "Chevron",
      "Best Buy",
      "Amazon",
      "Dollar General",
      "Dollar Tree",
      "eBay",
    ];
    const tier2 = stores.map((s) => s.name).filter((n) => !tier1.includes(n));
    const targetStores = args.tier === 1 ? tier1 : tier2;
    for (const storeName of targetStores) {
      const existing = stores.find(
        (s) => s.name.toLowerCase() === storeName.toLowerCase()
      );
      if (existing) {
        await ctx.runMutation(internal.publicCoupons.triggerDiscoveryForStore, {
          storeId: existing._id,
          storeName: existing.name,
        });
      }
    }
  },
});

export const triggerDiscoveryForStore = internalMutation({
  args: { storeId: v.id("stores"), storeName: v.string() },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.publicCoupons.discoverForStoreAction,
      { storeId: args.storeId, storeName: args.storeName }
    );
  },
});

export const discoverForStoreAction = internalAction({
  args: { storeId: v.id("stores"), storeName: v.string() },
  handler: async (ctx, args) => {
    const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const { threadId } = await couponAgent.createThread(ctx, {});
    await couponAgent.saveMessage(ctx, {
      threadId,
      prompt: `Find 3-5 active coupons currently available at ${args.storeName}.
For each deal, call the savePublicCoupon tool. You MUST always include ALL of these fields:
- storeName: "${args.storeName}"
- isManufacturer: false
- title: short coupon title
- description: one sentence about the deal
- discount: short string like "10% Off" or "$5 Off $30"
- code: the promo code string — use "" (empty string) if there is no code, never omit this field
- category: the store category such as "Grocery", "Gas", "Pharmacy", "Electronics" — use "General" if unsure, never omit this field
- expiresAt: expiration date in YYYY-MM-DD format — if unknown use ${ninetyDays}, never omit this field`,
      skipEmbeddings: true,
    });
    const result = await couponAgent.streamText(ctx, { threadId }, {});
    await result.consumeStream();
  },
});

export const triggerDiscoveryForGasStore = internalMutation({
  args: { storeId: v.id("stores"), storeName: v.string() },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.publicCoupons.discoverGasForStoreAction,
      { storeId: args.storeId, storeName: args.storeName }
    );
  },
});

export const discoverGasForStoreAction = internalAction({
  args: { storeId: v.id("stores"), storeName: v.string() },
  handler: async (ctx, args) => {
    const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const { threadId } = await couponAgent.createThread(ctx, {});
    await couponAgent.saveMessage(ctx, {
      threadId,
      prompt: `Find 3-5 active fuel and gas discount deals currently available at ${args.storeName}.
Include pump discounts, loyalty rewards, credit card fuel savings, and any car wash deals.
For each deal, call the savePublicCoupon tool. You MUST always include ALL of these fields:
- storeName: "${args.storeName}"
- isManufacturer: false
- title: short coupon title (e.g. "5¢ Off Per Gallon")
- description: one sentence about the deal
- discount: short string like "5¢ Off Per Gallon" or "10% Off Car Wash"
- code: the promo/loyalty code — use "" (empty string) if there is no code, never omit this field
- category: "Gas" — always use "Gas" for gas station deals, never omit this field
- expiresAt: expiration date in YYYY-MM-DD format — if unknown use ${ninetyDays}, never omit this field`,
      skipEmbeddings: true,
    });
    const result = await couponAgent.streamText(ctx, { threadId }, {});
    await result.consumeStream();
  },
});

export const verifyCoupon = mutation({
  args: { couponId: v.id("publicCoupons") },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.couponId);
    if (coupon) {
      await ctx.db.patch(args.couponId, {
        verifiedCount: coupon.verifiedCount + 1,
      });
    }
  },
});

export const seedPublicCoupons = mutation({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const seedData = [
      {
        store: "Shell",
        coupons: [
          {
            title: "5¢ off per gallon",
            code: "FUEL5",
            discount: "5¢ Off",
            desc: "With Fuel Rewards membership.",
          },
          {
            title: "10¢ off first fill-up",
            code: "SHELL10",
            discount: "10¢ Off",
            desc: "New members only.",
          },
          {
            title: "Iowa Special: 15¢ off",
            code: "IOWA15",
            discount: "15¢ Off",
            desc: "Valid only in Iowa Shell stations.",
            states: ["Iowa"],
          },
        ],
      },
      {
        store: "ExxonMobil",
        coupons: [
          {
            title: "6¢ off per gallon",
            code: "PLUS6",
            discount: "6¢ Off",
            desc: "With Rewards+ program.",
          },
          {
            title: "Extra 5¢ off",
            code: "LINK5",
            discount: "5¢ Off",
            desc: "When linking a credit card.",
          },
        ],
      },
      {
        store: "BP",
        coupons: [
          {
            title: "5¢ off per gallon",
            code: "BP5",
            discount: "5¢ Off",
            desc: "Driver Rewards members.",
          },
          {
            title: "Free car wash",
            code: "BPWASH",
            discount: "Free",
            desc: "With 10+ gallon fill-up.",
          },
        ],
      },
      {
        store: "Chevron",
        coupons: [
          {
            title: "10¢ off per gallon",
            code: "TEX10",
            discount: "10¢ Off",
            desc: "Texaco Rewards members.",
          },
          {
            title: "2x points on premium",
            code: "CHEV2X",
            discount: "2x Points",
            desc: "Valid all month.",
          },
        ],
      },
      {
        store: "Costco",
        coupons: [
          {
            title: "$20 Shop Card",
            code: "COSTCO20",
            discount: "$20 Back",
            desc: "New Executive members.",
          },
          {
            title: "$100 off Furniture",
            code: "HOME100",
            discount: "$100 Off",
            desc: "Select items over $999.",
          },
          {
            title: "Buy 3 Get 1 Free Tires",
            code: "TIRES",
            discount: "B3G1",
            desc: "Valid on Michelin and Bridgestone.",
          },
        ],
      },
      {
        store: "Sam's Club",
        coupons: [
          {
            title: "$15 off $50",
            code: "SAMS15",
            discount: "$15 Off",
            desc: "New members only.",
          },
          {
            title: "Free Rotisserie Chicken",
            code: "CHICKEN",
            discount: "Free",
            desc: "With first pickup order.",
          },
        ],
      },
      {
        store: "Aldi",
        coupons: [
          {
            title: "$5 off $30",
            code: "ALDI5",
            discount: "$5 Off",
            desc: "Valid on first delivery order.",
          },
        ],
      },
      {
        store: "Trader Joe's",
        coupons: [
          {
            title: "$2 off Flowers",
            code: "BLOOM",
            discount: "$2 Off",
            desc: "Seasonal bouquets.",
          },
        ],
      },
      {
        store: "Publix",
        coupons: [
          {
            title: "$5 off $30",
            code: "PUB5",
            discount: "$5 Off",
            desc: "Valid on first delivery.",
          },
          {
            title: "BOGO Deli Subs",
            code: "SUB",
            discount: "BOGO",
            desc: "Thursday only special.",
          },
        ],
      },
      {
        store: "H&M",
        coupons: [
          {
            title: "20% off one item",
            code: "HM20",
            discount: "20% Off",
            desc: "Join H&M rewards.",
          },
        ],
      },
      {
        store: "Dollar General",
        coupons: [
          {
            title: "$5 off $25",
            code: "SAVE5",
            discount: "$5 Off",
            desc: "Valid every Saturday.",
          },
        ],
      },
      {
        store: "Dollar Tree",
        coupons: [
          {
            title: "Buy 10 Get 1 Free",
            code: "TREE",
            discount: "B10G1",
            desc: "Valid on party supplies.",
          },
        ],
      },
      {
        store: "TJ Maxx",
        coupons: [
          {
            title: "10% off first order",
            code: "MAXX",
            discount: "10% Off",
            desc: "With TJX Rewards card.",
          },
        ],
      },
      {
        store: "Ross",
        coupons: [
          {
            title: "Senior Discount",
            code: "SENIOR",
            discount: "10% Off",
            desc: "Every Tuesday for 55+.",
          },
        ],
      },
      {
        store: "Michaels",
        coupons: [
          {
            title: "20% off regular price",
            code: "ART20",
            discount: "20% Off",
            desc: "Sitewide or in-store.",
          },
        ],
      },
      {
        store: "Petco",
        coupons: [
          {
            title: "$10 off $50",
            code: "PET10",
            discount: "$10 Off",
            desc: "Valid on food and treats.",
          },
        ],
      },
      {
        store: "Office Depot",
        coupons: [
          {
            title: "$15 off $75",
            code: "OFFICE15",
            discount: "$15 Off",
            desc: "Business essentials only.",
          },
        ],
      },
      {
        store: "GameStop",
        coupons: [
          {
            title: "$5 monthly reward",
            code: "PRO",
            discount: "$5 Off",
            desc: "Pro members only.",
          },
        ],
      },
      {
        store: "Starbucks",
        coupons: [
          {
            title: "BOGO Frappuccino",
            code: "FRAP",
            discount: "BOGO",
            desc: "Happy Hour special 2pm-5pm.",
          },
          {
            title: "Free Pastry",
            code: "STAR50",
            discount: "Free",
            desc: "With 50 reward stars.",
          },
        ],
      },
      {
        store: "McDonald's",
        coupons: [
          {
            title: "Free Large Fries",
            code: "APPFRIES",
            discount: "Free",
            desc: "With any $1 purchase in app.",
          },
          {
            title: "BOGO Big Mac",
            code: "BOGO",
            discount: "BOGO",
            desc: "Limit one per customer.",
          },
        ],
      },
      {
        store: "Chipotle",
        coupons: [
          {
            title: "Free Guac",
            code: "GUAC",
            discount: "Free",
            desc: "With any entree purchase.",
          },
        ],
      },
      {
        store: "Panera Bread",
        coupons: [
          {
            title: "Free Sip Club",
            code: "DRINK",
            discount: "Free",
            desc: "First 2 months free.",
          },
        ],
      },
      {
        store: "AutoZone",
        coupons: [
          {
            title: "$10 off $50",
            code: "AUTO10",
            discount: "$10 Off",
            desc: "Online or in-store.",
          },
        ],
      },
      {
        store: "Dick's Sporting Goods",
        coupons: [
          {
            title: "20% off apparel",
            code: "DSG20",
            discount: "20% Off",
            desc: "Select brands only.",
          },
        ],
      },
    ];
    for (const group of seedData) {
      const store = stores.find(
        (s) => s.name.toLowerCase() === group.store.toLowerCase()
      );
      if (store) {
        for (const c of group.coupons) {
          const existing = await ctx.db
            .query("publicCoupons")
            .withIndex("by_store", (q) => q.eq("storeId", store._id))
            .filter((q) => q.eq(q.field("code"), c.code))
            .first();
          if (!existing) {
            await ctx.db.insert("publicCoupons", {
              storeId: store._id,
              storeName: store.name,
              title: c.title,
              description: c.desc,
              code: c.code,
              discount: c.discount,
              category: "General",
              expiresAt,
              discoveredAt: Date.now(),
              isActive: true,
              verifiedCount: 30,
              barcode: "123456789012",
              isManufacturer: false,
              states: c.states, // Add states from seed data
            });
          }
        }
      }
    }
  },
});

/** Manual seed: fixed store IDs, 90-day expiry, dedupe by storeId + code. Run from dashboard or `npx convex run`. */
export const seedAllStoreCoupons = mutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    type SeedCoupon = { title: string; code: string; discount: string; desc: string };
    type StoreSeed = {
      storeId: Id<"stores">;
      storeName: string;
      category: string;
      coupons: SeedCoupon[];
    };

    const storeSeeds: StoreSeed[] = [
      {
        storeId: "m57dzdxvgeawzjt2v9b0s2mba586h3kp" as Id<"stores">,
        storeName: "Shell",
        category: "Gas",
        coupons: [
          { title: "5¢ Off Per Gallon", code: "SHELLSAVE5", discount: "5¢/gal", desc: "Fuel Rewards members. Up to 20 gallons." },
          { title: "10¢ Off First Fill-Up", code: "SHELLNEW10", discount: "10¢/gal", desc: "New Fuel Rewards members only. One use." },
          { title: "Free Car Wash with Fill-Up", code: "SHELLWASH", discount: "Free Wash", desc: "With any 8+ gallon purchase." },
        ],
      },
      {
        storeId: "m57e9swvw4rc51c27p9rtts1dh86gf5c" as Id<"stores">,
        storeName: "ExxonMobil",
        category: "Gas",
        coupons: [
          { title: "6¢ Off Per Gallon", code: "EXXON6", discount: "6¢/gal", desc: "Exxon Mobil Rewards+ members." },
          { title: "3¢ Off Every Gallon Always", code: "MOBILLNK", discount: "3¢/gal", desc: "Link a credit/debit card to your account." },
          { title: "$0.10 Off Per Gallon – Weekend Only", code: "EXXONWKND", discount: "10¢/gal", desc: "Saturdays and Sundays only." },
        ],
      },
      {
        storeId: "m57633a5hj37v9r9r0xy2a2s7s86hd04" as Id<"stores">,
        storeName: "BP",
        category: "Gas",
        coupons: [
          { title: "5¢ Off Per Gallon", code: "BPDRIVER5", discount: "5¢/gal", desc: "BPme Rewards members." },
          { title: "Free Car Wash", code: "BPWASH2", discount: "Free Wash", desc: "With 10+ gallon fill-up at participating locations." },
          { title: "10¢ Off First Fill-Up", code: "BPNEW10", discount: "10¢/gal", desc: "New BPme Rewards app members only." },
        ],
      },
      {
        storeId: "m57crhespn2vh7g1xb83cm4dcn86g57j" as Id<"stores">,
        storeName: "Chevron",
        category: "Gas",
        coupons: [
          { title: "3¢ Off Per Gallon", code: "CHEVRON3", discount: "3¢/gal", desc: "Chevron app members at participating stations." },
          { title: "2x Points on Premium Fuel", code: "CHEV2XPREM", discount: "2× Points", desc: "Valid all month on Chevron Supreme." },
          { title: "$0.25 Off First Gallon", code: "CHEVNEW25", discount: "25¢/gal", desc: "New app members, first fill-up only." },
        ],
      },
      {
        storeId: "m57b9mfmpe326e86p133w3ffss86hefm" as Id<"stores">,
        storeName: "Texaco",
        category: "Gas",
        coupons: [
          { title: "5¢ Off Per Gallon", code: "TEXACO5", discount: "5¢/gal", desc: "Texaco Techron Advantage app members." },
          { title: "BOGO Car Wash", code: "TEXWASHBOGO", discount: "BOGO Wash", desc: "Buy one car wash, get one free." },
        ],
      },
      {
        storeId: "m5776vmp8478cg2rw2ep1kr8qd86hymm" as Id<"stores">,
        storeName: "Marathon",
        category: "Gas",
        coupons: [
          { title: "3¢ Off Per Gallon", code: "MARA3", discount: "3¢/gal", desc: "MPACT Rewards members." },
          { title: "$5 Off $30 In-Store Purchase", code: "MARASAVE5", discount: "$5 Off", desc: "Valid in Marathon convenience store only." },
          { title: "Free 20oz Drink with Fill-Up", code: "MARADRINK", discount: "Free Drink", desc: "Any fountain or bottled drink with 8+ gallons." },
        ],
      },
      {
        storeId: "m577gjrp28y0zqaeghdt88b99n86grg5" as Id<"stores">,
        storeName: "Speedway",
        category: "Gas",
        coupons: [
          { title: "10¢ Off Per Gallon", code: "SPEEDY10", discount: "10¢/gal", desc: "Speedy Rewards members. Max 20 gallons." },
          { title: "Free Coffee Any Size", code: "SPEEDYCAFE", discount: "Free Coffee", desc: "With any fuel purchase. App required." },
          { title: "$1 Off Any Hot Food Item", code: "SPEEDYFOOD1", discount: "$1 Off", desc: "Valid on roller grill or pizza." },
        ],
      },
      {
        storeId: "m5755wyy8cvtbjn6rff126hwj986hwwd" as Id<"stores">,
        storeName: "Circle K",
        category: "Gas",
        coupons: [
          { title: "25¢ Off Per Gallon – First Fillup", code: "CKFIRST25", discount: "25¢/gal", desc: "New Inner Circle members, one-time use." },
          { title: "Free Polar Pop Any Size", code: "CKPOLAR", discount: "Free Drink", desc: "Any fountain drink with fuel purchase." },
          { title: "5¢ Off Every Gallon", code: "CK5GAL", discount: "5¢/gal", desc: "Ongoing Inner Circle member benefit." },
        ],
      },
      {
        storeId: "m5708d4nn2754y4mts6kbs0q5s86h2fq" as Id<"stores">,
        storeName: "7-Eleven",
        category: "Gas",
        coupons: [
          { title: "11¢ Off Per Gallon", code: "7E11CENTS", discount: "11¢/gal", desc: "7Rewards app members at participating 7-Eleven fuel stations." },
          { title: "Free Big Gulp with Fuel", code: "7GULP", discount: "Free Drink", desc: "Any size Big Gulp with 5+ gallon fill-up." },
          { title: "$1 Off Any Slurpee", code: "SLURPEE1", discount: "$1 Off", desc: "Valid in-app. One per visit." },
        ],
      },
      {
        storeId: "m57eaq6g5wsj72tddg0k4tb74n86hadj" as Id<"stores">,
        storeName: "Wawa",
        category: "Gas",
        coupons: [
          { title: "3¢ Off Per Gallon", code: "WAWA3", discount: "3¢/gal", desc: "Wawa Rewards members. Every fill-up." },
          { title: "Free Hoagie with Fill-Up", code: "WAWAHOAGIE", discount: "Free Hoagie", desc: "With 10+ gallon purchase. App required." },
          { title: "Free Coffee Any Size", code: "WAWACAFE", discount: "Free Coffee", desc: "Any hot coffee with any fuel purchase, Mondays." },
        ],
      },
      {
        storeId: "m5712kankny9mv6c10r2p5gpdn86gg9b" as Id<"stores">,
        storeName: "Sheetz",
        category: "Gas",
        coupons: [
          { title: "5¢ Off Per Gallon", code: "SHEETZ5", discount: "5¢/gal", desc: "MySheetz Card members." },
          { title: "Free MTO Sandwich", code: "SHEETZFREE", discount: "Free Sandwich", desc: "Any MTO sub with 10+ gallon fill-up via app." },
          { title: "$1 Off Any Energy Drink", code: "SHEETZENERGY", discount: "$1 Off", desc: "Valid on Monster, Red Bull, or Celsius." },
        ],
      },
      {
        storeId: "m57bxw4j2edxkzy5s6brszzc4n86gbng" as Id<"stores">,
        storeName: "QuikTrip",
        category: "Gas",
        coupons: [
          { title: "3¢ Off Per Gallon", code: "QT3", discount: "3¢/gal", desc: "QT Rewards app members." },
          { title: "Free Fountain Drink", code: "QTDRINK", discount: "Free Drink", desc: "Any fountain drink with fuel purchase." },
          { title: "Buy 2 Hot Dogs Get 1 Free", code: "QTHDOG", discount: "B2G1 Hot Dog", desc: "Valid at QT Kitchen roller grill." },
        ],
      },
      {
        storeId: "m574vxz6tryv2eanqhk6s5t07d86hgy7" as Id<"stores">,
        storeName: "RaceTrac",
        category: "Gas",
        coupons: [
          { title: "5¢ Off Per Gallon", code: "RTRAC5", discount: "5¢/gal", desc: "RaceTrac Rewards app members." },
          { title: "Free Swirl World Frozen Yogurt", code: "RSWIRL", discount: "Free Frozen Yogurt", desc: "One free small with any fuel purchase, weekends." },
          { title: "$0.99 Any Size Coffee", code: "RTCAFE99", discount: "$0.99 Coffee", desc: "Any hot or iced coffee all day." },
        ],
      },
      {
        storeId: "m574bc77erz8adyctwbrrxqjgx86ga05" as Id<"stores">,
        storeName: "Murphy USA",
        category: "Gas",
        coupons: [
          { title: "3¢ Off Per Gallon", code: "MURPHY3", discount: "3¢/gal", desc: "Murphy Drive Rewards members." },
          { title: "10¢ Off First Fill-Up", code: "MURPHYNEW10", discount: "10¢/gal", desc: "New Murphy Drive Rewards sign-up bonus." },
          { title: "Free 20oz Drink", code: "MURPHYDRINK", discount: "Free Drink", desc: "Any 20oz drink with 8+ gallon fill-up." },
        ],
      },
      {
        storeId: "m5751gr89gvkr6egt03fmdx00n86g5pv" as Id<"stores">,
        storeName: "Pilot Flying J",
        category: "Gas",
        coupons: [
          { title: "5¢ Off Per Gallon", code: "PILOT5", discount: "5¢/gal", desc: "myPilot app members. Professional drivers." },
          { title: "Free Shower Credit", code: "PILOTSHOWER", discount: "Free Shower", desc: "One free shower with 50+ gallon diesel purchase." },
          { title: "$3 Off Any Truck Stop Restaurant Meal", code: "PILOTMEAL3", discount: "$3 Off", desc: "Valid at Denny's or Subway inside Pilot Flying J." },
        ],
      },
      {
        storeId: "m578se0snn72vywq85sg2s1w0s86g68m" as Id<"stores">,
        storeName: "Love's Travel Stops",
        category: "Gas",
        coupons: [
          { title: "3¢ Off Per Gallon", code: "LOVES3", discount: "3¢/gal", desc: "Love's Connect Rewards app members." },
          { title: "Free Shower with 50 Gal Diesel", code: "LOVESHOWER", discount: "Free Shower", desc: "Professional drivers. Diesel purchase required." },
          { title: "$2 Off Chester's Chicken", code: "LOVECHICKEN2", discount: "$2 Off", desc: "Any Chester's Chicken combo inside Love's." },
        ],
      },
      {
        storeId: "m579r3n0k1fjssaegd4tr6ck1d86gxn3" as Id<"stores">,
        storeName: "CVS",
        category: "Pharmacy",
        coupons: [
          { title: "$5 Off $20 Purchase", code: "CVS5OFF20", discount: "$5 Off", desc: "Valid in-store or online. ExtraCare members." },
          { title: "40% Off CVS Brand Products", code: "CVSBRAND40", discount: "40% Off", desc: "CVS Health brand vitamins and supplements." },
          { title: "BOGO Free Cosmetics", code: "CVSBOGO", discount: "BOGO", desc: "Buy one, get one free on select beauty items." },
          { title: "Free Photo Prints – 50 Count", code: "CVSPHOTO50", discount: "Free Prints", desc: "50 free 4x6 prints with CVS Photo app." },
        ],
      },
      {
        storeId: "m579hgzd6dnqza63frjnb3ww2x86hcaq" as Id<"stores">,
        storeName: "Walgreens",
        category: "Pharmacy",
        coupons: [
          { title: "$5 Off $20 Purchase", code: "WG5OFF20", discount: "$5 Off", desc: "myWalgreens members. In-store only." },
          { title: "20% Off Walgreens Brand", code: "WGBRAND20", discount: "20% Off", desc: "Walgreens own-brand health and beauty products." },
          { title: "BOGO 50% Off Vitamins", code: "WGVITBOGO", discount: "BOGO 50% Off", desc: "Select vitamin brands. myWalgreens members." },
          { title: "Free 8x10 Photo Print", code: "WGPHOTO8X10", discount: "Free Print", desc: "One free 8x10 print with Walgreens app." },
        ],
      },
      {
        storeId: "m578bskrep8q3kn81vktnnzr9986gbrw" as Id<"stores">,
        storeName: "Rite Aid",
        category: "Pharmacy",
        coupons: [
          { title: "$5 Off $25 Purchase", code: "RITEAID5", discount: "$5 Off", desc: "wellness+ rewards members. One per visit." },
          { title: "25% Off Rite Aid Brand", code: "RABRAND25", discount: "25% Off", desc: "All Rite Aid store-brand products." },
          { title: "BOGO Free Cold & Flu Products", code: "RACOLDBOGO", discount: "BOGO", desc: "Select cold, flu, and allergy medications." },
        ],
      },
      {
        storeId: "m57400gas9nx2n5k1jdchjv09986hrx1" as Id<"stores">,
        storeName: "Duane Reade",
        category: "Pharmacy",
        coupons: [
          { title: "$4 Off $20 Purchase", code: "DR4OFF20", discount: "$4 Off", desc: "Balance Rewards members. NYC locations." },
          { title: "20% Off Beauty Products", code: "DRBEAUTY20", discount: "20% Off", desc: "Cosmetics and skincare. Balance Rewards required." },
          { title: "Free Greeting Card", code: "DRCARD", discount: "Free Card", desc: "One free greeting card per month with app." },
        ],
      },
      {
        storeId: "m57a85czypdpm8mp1rmw3937dx86g8y4" as Id<"stores">,
        storeName: "Target",
        category: "Grocery",
        coupons: [
          { title: "$10 Off $50 Grocery Purchase", code: "TGT10GROC", discount: "$10 Off", desc: "Target Circle members. Online or in-store." },
          { title: "20% Off One Clothing Item", code: "TGTCLOTH20", discount: "20% Off", desc: "Target Circle exclusive. One item, any brand." },
          { title: "5% Off with Target RedCard", code: "TGTREDCARD", discount: "5% Off", desc: "Everyday discount with Target RedCard debit or credit." },
          { title: "BOGO 50% Off Toys", code: "TGTTOYBOGO", discount: "BOGO 50% Off", desc: "Select toys and games. Target Circle required." },
        ],
      },
      {
        storeId: "m57ev29e3h5r19842be534hh9d86ga72" as Id<"stores">,
        storeName: "Walmart",
        category: "Grocery",
        coupons: [
          { title: "$10 Off $50 Grocery Pickup", code: "WMPICKUP10", discount: "$10 Off", desc: "First grocery pickup order. New customers." },
          { title: "Free Delivery on First Order", code: "WMFREE1ST", discount: "Free Delivery", desc: "Walmart+ members, first delivery free." },
          { title: "20% Off Walmart+ Membership", code: "WMPLUS20", discount: "20% Off", desc: "New Walmart+ annual membership sign-up." },
        ],
      },
      {
        storeId: "m573zs3rtre13e0sj9f9qp2w2s86htrc" as Id<"stores">,
        storeName: "Kroger",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "KRG5OFF30", discount: "$5 Off", desc: "Load to Kroger card via app. One per household." },
          { title: "4x Fuel Points on Gift Cards", code: "KRGFUEL4X", discount: "4× Fuel Points", desc: "Buy gift cards to earn 4x fuel points." },
          { title: "Free Friday Download", code: "KRGFREEFRIDAY", discount: "Free Item", desc: "Load free item coupon every Friday in Kroger app." },
          { title: "BOGO Free Kroger Brand", code: "KRGBRANDBOGO", discount: "BOGO", desc: "Buy one Kroger brand item, get one free." },
        ],
      },
      {
        storeId: "m572y62j2054m8tkkvekrqc88d86hy9r" as Id<"stores">,
        storeName: "Safeway",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Just for U", code: "SFW5OFF30", discount: "$5 Off", desc: "Just for U app members. Load and save." },
          { title: "Free Item Friday", code: "SFWFREEFRI", discount: "Free Item", desc: "Weekly free item offer in the Safeway app." },
          { title: "10% Off Safeway Brand", code: "SFWBRAND10", discount: "10% Off", desc: "All Safeway/Signature Select store brand items." },
          { title: "$10 Off $60 Online Order", code: "SFWONLINE10", discount: "$10 Off", desc: "Online grocery delivery or pickup." },
        ],
      },
      {
        storeId: "m57770gc1azw05e8jqkkdpy0ah86hbre" as Id<"stores">,
        storeName: "Whole Foods",
        category: "Grocery",
        coupons: [
          { title: "10% Off with Prime", code: "WFPRIME10", discount: "10% Off", desc: "Amazon Prime members get 10% off select items." },
          { title: "$10 Off $40 First Order", code: "WFFIRST10", discount: "$10 Off", desc: "First Amazon/Whole Foods delivery order." },
          { title: "Extra 10% Off Weekly Sales", code: "WFPRIMESALE", discount: "Extra 10% Off", desc: "Prime members get additional 10% off sale items." },
        ],
      },
      {
        storeId: "m57ffbnfynay14gkwg7t3d3v7n86hjmy" as Id<"stores">,
        storeName: "Costco",
        category: "Grocery",
        coupons: [
          { title: "$20 Shop Card – New Executive Member", code: "COSTCOEXEC20", discount: "$20 Credit", desc: "New Executive membership sign-up bonus." },
          { title: "$100 Off Furniture Over $999", code: "COSTCOHOME100", discount: "$100 Off", desc: "Select home and furniture items only." },
          { title: "$30 Off Costco Travel", code: "COSTCOTRAVEL30", discount: "$30 Off", desc: "Book vacation packages through Costco Travel." },
          { title: "Free Rotisserie Chicken Coupon", code: "COSTCOCHICKEN", discount: "Free Chicken", desc: "App members monthly reward." },
        ],
      },
      {
        storeId: "m57axjwm69h66et6x66fh6wcm986grmn" as Id<"stores">,
        storeName: "Sam's Club",
        category: "Grocery",
        coupons: [
          { title: "$15 Off $50 for New Members", code: "SAMS15NEW", discount: "$15 Off", desc: "New Sam's Club membership exclusive." },
          { title: "Free Rotisserie Chicken", code: "SAMSBIRD", discount: "Free Chicken", desc: "With first curbside pickup order via Sam's app." },
          { title: "10% Off Sam's Club Brand", code: "SAMSBRAND10", discount: "10% Off", desc: "Member's Mark and Sam's Choice products." },
        ],
      },
      {
        storeId: "m57fs20ykg9zb34ykk3a3acrsh86g9v2" as Id<"stores">,
        storeName: "Aldi",
        category: "Grocery",
        coupons: [
          { title: "$10 Off $40 First Delivery", code: "ALDI10DEL", discount: "$10 Off", desc: "First Aldi delivery order via Instacart." },
          { title: "Free Produce Item of the Week", code: "ALDIFREE", discount: "Free Item", desc: "Weekly free item available in ALDI app." },
          { title: "$5 Off $30 Purchase", code: "ALDI5OFF30", discount: "$5 Off", desc: "Valid every Tuesday in-store only." },
        ],
      },
      {
        storeId: "m57bq9yqndfx0mec37rwtv1qv186gaes" as Id<"stores">,
        storeName: "Trader Joe's",
        category: "Grocery",
        coupons: [
          { title: "$2 Off Fresh Flowers", code: "TJBLOOM2", discount: "$2 Off", desc: "Seasonal bouquets and arrangements." },
          { title: "Free Reusable Bag", code: "TJBAG", discount: "Free Bag", desc: "One free reusable shopping bag per customer." },
          { title: "10% Off Wine", code: "TJWINE10", discount: "10% Off", desc: "Select Trader Joe's exclusive wine labels." },
        ],
      },
      {
        storeId: "m5703dcm8kvw5cz9m97bmezbyd86gk8j" as Id<"stores">,
        storeName: "Publix",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Delivery Order", code: "PUBDEL5", discount: "$5 Off", desc: "First Publix delivery order via Instacart." },
          { title: "BOGO Free Deli Subs – Thursdays", code: "PUBSUBBOGO", discount: "BOGO Sub", desc: "Every Thursday: buy one 6\" sub, get one free." },
          { title: "Digital Coupon – $3 Off $15", code: "PUBDIG3", discount: "$3 Off", desc: "Load to your Publix account. One per order." },
          { title: "Free Item with Publix App", code: "PUBAPPFREE", discount: "Free Item", desc: "Monthly free item offer for app users." },
        ],
      },
      {
        storeId: "m57dawqdde53m5yw1zemx2akz586g35y" as Id<"stores">,
        storeName: "Albertsons",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Just for U", code: "ALB5OFF30", discount: "$5 Off", desc: "Albertsons Just for U digital coupon." },
          { title: "Free Item of the Week", code: "ALBFREEITEM", discount: "Free Item", desc: "Weekly free item loaded to your Just for U account." },
          { title: "10% Off Signature Select", code: "ALBSIG10", discount: "10% Off", desc: "All Signature Select store brand products." },
        ],
      },
      {
        storeId: "m570qv3sc7t5h0nxtdn5f3wnq186gwtq" as Id<"stores">,
        storeName: "Vons",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $25 Order", code: "VONS5OFF25", discount: "$5 Off", desc: "Vons for U members. Load to your card." },
          { title: "BOGO Free Deli Chicken", code: "VONSDELIBOGO", discount: "BOGO", desc: "Buy one rotisserie chicken, get one free." },
          { title: "10% Off Vons Store Brand", code: "VONSBRAND10", discount: "10% Off", desc: "Signature Select and Lucerne brand items." },
        ],
      },
      {
        storeId: "m57aa8ps6xa5qa9ta78gdm9g0x86gg29" as Id<"stores">,
        storeName: "Jewel-Osco",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $25 Just for U", code: "JO5OFF25", discount: "$5 Off", desc: "Jewel-Osco Just for U app digital coupon." },
          { title: "Free Bakery Item Friday", code: "JOBAKE", discount: "Free Item", desc: "Free bakery item every Friday with Just for U." },
          { title: "20% Off Signature Select", code: "JOSIG20", discount: "20% Off", desc: "Signature Select and Lucerne brand products." },
        ],
      },
      {
        storeId: "m57b6vgx8bwc6xz1x880m3tn9d86hv96" as Id<"stores">,
        storeName: "Harris Teeter",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 e-VIC Coupon", code: "HT5OFF30", discount: "$5 Off", desc: "Harris Teeter e-VIC digital coupon members." },
          { title: "Free Item Monthly", code: "HTFREEITEM", discount: "Free Item", desc: "Monthly free item for e-VIC members." },
          { title: "BOGO Free HT Brand", code: "HTBRANDBOGO", discount: "BOGO", desc: "Buy one Harris Teeter brand item, get one free." },
        ],
      },
      {
        storeId: "m577jjryv73nk6tfjgftb091j986hy1r" as Id<"stores">,
        storeName: "Fred Meyer",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "FM5OFF30", discount: "$5 Off", desc: "Fred Meyer Rewards card members." },
          { title: "4x Fuel Points on Gift Cards", code: "FMGIFT4X", discount: "4× Fuel Points", desc: "Purchase gift cards to earn extra fuel points." },
          { title: "Free Friday Item", code: "FMFREEFRI", discount: "Free Item", desc: "Download weekly free item in Fred Meyer app." },
        ],
      },
      {
        storeId: "m57f06fnfe3tsf1y73g4zw5mqh86g52g" as Id<"stores">,
        storeName: "Ralphs",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "RALPH5OFF30", discount: "$5 Off", desc: "Ralphs Rewards card members. Load via app." },
          { title: "Free Friday Download", code: "RALPHSFREE", discount: "Free Item", desc: "Free item every Friday loaded to Ralphs account." },
          { title: "4x Fuel Points on Gift Cards", code: "RALPHSGIFT4X", discount: "4× Fuel Points", desc: "Earn 4x fuel points when buying gift cards." },
        ],
      },
      {
        storeId: "m573ypvsywymzm5mqm25nzt44986gg9w" as Id<"stores">,
        storeName: "Smith's",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "SMITHS5OFF", discount: "$5 Off", desc: "Smith's Rewards card. Load to card in app." },
          { title: "4x Fuel Points on Gift Cards", code: "SMITHSGIFT4X", discount: "4× Fuel Points", desc: "Gift card purchases earn 4x fuel points." },
          { title: "Free Item of the Week", code: "SMITHSFREE", discount: "Free Item", desc: "Weekly free item for Smith's app members." },
        ],
      },
      {
        storeId: "m57bx2b3d18gy92beaxg968ga586hcwj" as Id<"stores">,
        storeName: "Fry's",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "FRYS5OFF30", discount: "$5 Off", desc: "Fry's VIP Card members. Load via Fry's app." },
          { title: "Free Friday Item", code: "FRYSFREE", discount: "Free Item", desc: "Weekly free item download in Fry's Food app." },
          { title: "4x Fuel Points on Gift Cards", code: "FRYSGIFT4X", discount: "4× Fuel Points", desc: "Earn 4x fuel points on gift card purchases." },
        ],
      },
      {
        storeId: "m5718fbest2c3x7e50xhnmd8ks86hvsy" as Id<"stores">,
        storeName: "King Soopers",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "KS5OFF30", discount: "$5 Off", desc: "King Soopers Rewards card members." },
          { title: "4x Fuel Points on Gift Cards", code: "KSGIFT4X", discount: "4× Fuel Points", desc: "Earn 4x fuel points when buying gift cards." },
          { title: "Free Friday Item", code: "KSFRIDAY", discount: "Free Item", desc: "Weekly free item for King Soopers app users." },
        ],
      },
      {
        storeId: "m57bf1jkjzg7z87jyf7vvzbr2h86hhvt" as Id<"stores">,
        storeName: "QFC",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "QFC5OFF30", discount: "$5 Off", desc: "QFC Rewards card members. Load digitally." },
          { title: "Free Friday Item", code: "QFCFREE", discount: "Free Item", desc: "Weekly free item download in QFC app." },
          { title: "10% Off QFC Store Brand", code: "QFCBRAND10", discount: "10% Off", desc: "Private Selection and QFC brand products." },
        ],
      },
      {
        storeId: "m57cfjd7zna6e2w0agwf9xa92n86hx0h" as Id<"stores">,
        storeName: "Sprouts Farmers Market",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Purchase", code: "SPROUTS5", discount: "$5 Off", desc: "Sprouts app members. First app order." },
          { title: "BOGO Free Bulk Nuts & Seeds", code: "SPROUTSBULK", discount: "BOGO", desc: "Buy one pound bulk nuts, get one free. Wednesday only." },
          { title: "Double Ad Wednesday", code: "SPROUTSWED", discount: "2× Deals", desc: "Shop both the current and upcoming ad on Wednesdays." },
        ],
      },
      {
        storeId: "m5706cftyt4jxm1ysevvmedghs86ggxh" as Id<"stores">,
        storeName: "Fresh Thyme Market",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Purchase", code: "FTHYME5", discount: "$5 Off", desc: "Fresh Thyme Rewards members. App required." },
          { title: "Free Organic Produce Item", code: "FTHYMEFREE", discount: "Free Item", desc: "Weekly free organic produce for app members." },
          { title: "25% Off Vitamins & Supplements", code: "FTHYMEVIT25", discount: "25% Off", desc: "All vitamins and supplements every Sunday." },
        ],
      },
      {
        storeId: "m570gbbv5tekw74hq6zf07trx186hmsz" as Id<"stores">,
        storeName: "ShopRite",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $50 Price Plus Club", code: "SR5OFF50", discount: "$5 Off", desc: "Price Plus Club members. Load to club card." },
          { title: "Free Turkey at Thanksgiving", code: "SRTURKEY", discount: "Free Turkey", desc: "Spend $400+ before Thanksgiving. Price Plus required." },
          { title: "BOGO Free Bakery Items", code: "SRBAKERYBOGO", discount: "BOGO", desc: "Buy one bakery item, get one free. Weekends." },
        ],
      },
      {
        storeId: "m57eg1shycvzastfgy8h53tm3d86hh35" as Id<"stores">,
        storeName: "Giant Eagle",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "GE5OFF30", discount: "$5 Off", desc: "Giant Eagle Advantage Card members." },
          { title: "10¢ Off Per Gallon at GetGo", code: "GEGETGO10", discount: "10¢/gal", desc: "Giant Eagle Advantage Card fuel discount at GetGo." },
          { title: "fuelperks+ Bonus Points", code: "GEFUEL2X", discount: "2× Fuel Points", desc: "Earn double fuelperks+ on all purchases this week." },
        ],
      },
      {
        storeId: "m57c72e1wzw3xdjyspp67b4q2586g58n" as Id<"stores">,
        storeName: "Food Lion",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 MVP Card", code: "FL5OFF30", discount: "$5 Off", desc: "Food Lion MVP Card digital coupon members." },
          { title: "Free Item Every Friday", code: "FLFREEITEM", discount: "Free Item", desc: "Weekly free item for MVP Card holders via app." },
          { title: "BOGO Free Food Lion Brand", code: "FLBRANDBOGO", discount: "BOGO", desc: "Buy one Food Lion brand, get one free." },
        ],
      },
      {
        storeId: "m570esp83xmqg2p8esxw2g24cs86gjga" as Id<"stores">,
        storeName: "H-E-B",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Digital Coupon", code: "HEB5OFF30", discount: "$5 Off", desc: "H-E-B app members. Load and save in store." },
          { title: "Free Item of the Week", code: "HEBFREE", discount: "Free Item", desc: "Weekly free item download in H-E-B app." },
          { title: "20% Off H-E-B Brand", code: "HEBBRAND20", discount: "20% Off", desc: "All H-E-B and Central Market store brand products." },
          { title: "$10 Off $60 Curbside", code: "HEBCURB10", discount: "$10 Off", desc: "First H-E-B Curbside pickup order." },
        ],
      },
      {
        storeId: "m57aks4gfywrcn7akw8bf1faf986g3rr" as Id<"stores">,
        storeName: "Wegmans",
        category: "Grocery",
        coupons: [
          { title: "$5 Off $30 Shoppers Club", code: "WEG5OFF30", discount: "$5 Off", desc: "Wegmans Shoppers Club members. Load digitally." },
          { title: "Free Wegmans Brand Item", code: "WEGFREE", discount: "Free Item", desc: "Monthly free Wegmans brand item for app members." },
          { title: "15% Off Wegmans Prepared Foods", code: "WEGPREP15", discount: "15% Off", desc: "All ready-to-eat prepared foods and sushi." },
          { title: "Double Points on Organic Items", code: "WEGORGANIC2X", discount: "2× Points", desc: "Earn double points on all certified organic purchases." },
        ],
      },
    ];

    let inserted = 0;
    let skipped = 0;
    for (const store of storeSeeds) {
      for (const c of store.coupons) {
        const existing = await ctx.db
          .query("publicCoupons")
          .withIndex("by_store", (q) => q.eq("storeId", store.storeId))
          .filter((q) => q.eq(q.field("code"), c.code))
          .first();
        if (!existing) {
          await ctx.db.insert("publicCoupons", {
            storeId: store.storeId,
            storeName: store.storeName,
            title: c.title,
            description: c.desc,
            code: c.code,
            discount: c.discount,
            category: store.category,
            expiresAt,
            discoveredAt: Date.now(),
            isActive: true,
            verifiedCount: 25,
            isManufacturer: false,
          });
          inserted++;
        } else {
          skipped++;
        }
      }
    }
    return { inserted, skipped };
  },
});
