import { v } from "convex/values";
import { mutation, action, query, internalAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { couponAgent } from "./agent";
import { auth } from "./auth";
import type { Doc } from "./_generated/dataModel";

const PLACEHOLDER_BARCODE = "123456789012";

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

    // FIX #1: Filter out placeholder barcodes
    const withoutPlaceholders = coupons.filter(
      (c) => c.barcode !== PLACEHOLDER_BARCODE
    );

    const stateFilteredCoupons = withoutPlaceholders.filter((c) => {
      if (!c.states || c.states.length === 0) return true;
      if (!userState) return true;
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

    // FIX #1: Filter out placeholder barcodes
    const withoutPlaceholders = allRaw.filter(
      (c) => c.barcode !== PLACEHOLDER_BARCODE
    );

    const stateFiltered = withoutPlaceholders.filter((c) => {
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
      // FIX #1: Filter out placeholder barcodes
      if (coupon && coupon.isActive && coupon.barcode !== PLACEHOLDER_BARCODE) {
        coupons.push({ ...coupon, isClipped: true });
      }
    }

    return groupCouponsByStore(coupons, stores);
  },
});

// FIX #1: Mutation to delete all placeholder coupons
export const deactivatePlaceholderCoupons = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("publicCoupons").collect();
    const placeholders = all.filter((c) => c.barcode === PLACEHOLDER_BARCODE);
    let deleted = 0;
    for (const c of placeholders) {
      await ctx.db.delete(c._id);
      deleted++;
    }
    return { deleted };
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const stores: Doc<"stores">[] = await ctx.runQuery(api.stores.list, {});
    const tier1 = [
      "Target", "Walmart", "Kroger", "Safeway", "Whole Foods", "Costco",
      "Sam's Club", "Aldi", "Trader Joe's", "Publix", "CVS", "Walgreens",
      "Shell", "ExxonMobil", "BP", "Chevron", "Best Buy", "Amazon",
      "Dollar General", "Dollar Tree", "eBay",
    ];
    const tier2 = stores.map((s: Doc<"stores">) => s.name).filter((n: string) => !tier1.includes(n));
    const targetStores = args.tier === 1 ? tier1 : tier2;
    for (const storeName of targetStores) {
      const existing = stores.find(
        (s: Doc<"stores">) => s.name.toLowerCase() === storeName.toLowerCase()
      );
      if (existing) {
        await ctx.runMutation(internal.publicCoupons.triggerDiscoveryForStore, {
          storeId: existing._id,
          storeName: existing.name,
        });
      }
    }
    return null;
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const { threadId } = await couponAgent.createThread(ctx, {});
    await couponAgent.saveMessage(ctx, {
      threadId,
      prompt: `Search ACTIVE coupons at ${args.storeName}. Call savePublicCoupon tool for 3-5 high-quality active deals. You MUST provide a real sourceUrl for every coupon — never invent example coupons.`,
      skipEmbeddings: true,
    });
    const result = await couponAgent.streamText(ctx, { threadId }, {});
    await result.consumeStream();
    return null;
  },
});

// FIX #3: Internal version used by cron scheduler (crons can only call internal functions)
export const discoverGasStationDealsInternal = internalAction({
  args: {},
  returns: v.object({ triggered: v.number() }),
  handler: async (ctx) => {
    const stores: Doc<"stores">[] = await ctx.runQuery(api.stores.list, {
      category: "Gas",
    });
    for (const store of stores) {
      await ctx.scheduler.runAfter(
        0,
        internal.publicCoupons.discoverGasForStoreAction,
        { storeId: store._id, storeName: store.name }
      );
    }
    return { triggered: stores.length };
  },
});

// FIX #3: Public action callable from admin/dashboard
export const discoverGasStationDeals = action({
  args: {},
  returns: v.object({ triggered: v.number() }),
  handler: async (ctx) => {
    const stores: Doc<"stores">[] = await ctx.runQuery(api.stores.list, {
      category: "Gas",
    });
    for (const store of stores) {
      await ctx.scheduler.runAfter(
        0,
        internal.publicCoupons.discoverGasForStoreAction,
        { storeId: store._id, storeName: store.name }
      );
    }
    return { triggered: stores.length };
  },
});

// FIX #3: Internal action — finds fuel deals for one gas station
export const discoverGasForStoreAction = internalAction({
  args: { storeId: v.id("stores"), storeName: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { threadId } = await couponAgent.createThread(ctx, {});
    await couponAgent.saveMessage(ctx, {
      threadId,
      prompt: `Find current fuel prices and discounts at ${args.storeName}.
Look for: per-gallon price (Regular, Midgrade, Premium, Diesel), fuel discount programs (cents off per gallon), and loyalty fuel rewards.
Call savePublicCoupon with the fuelPrice, fuelType, fuelDiscountCents, and loyaltyProgram fields filled in where applicable.
NEVER invent fuel prices. You MUST provide a real sourceUrl. Only save deals you can verify.`,
      skipEmbeddings: true,
    });
    const result = await couponAgent.streamText(ctx, { threadId }, {});
    await result.consumeStream();
    return null;
  },
});

// FIX #3: Gas stations with active fuel deals (Gas category only), sorted by lowest fuelPrice
export const listGasSavingsStations = query({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    const gasStoreIds = new Set(
      stores.filter((s) => s.category === "Gas").map((s) => s._id)
    );

    const coupons = await ctx.db
      .query("publicCoupons")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const gasCoupons = coupons.filter(
      (c) =>
        c.fuelPrice !== undefined &&
        c.fuelPrice !== null &&
        c.barcode !== PLACEHOLDER_BARCODE &&
        !!c.storeId &&
        gasStoreIds.has(c.storeId)
    );

    if (gasCoupons.length === 0) return [];

    const byStoreId: Record<string, (typeof gasCoupons)[number]> = {};
    for (const c of gasCoupons) {
      const key = c.storeId as string;
      if (!byStoreId[key] || c.fuelPrice! < byStoreId[key].fuelPrice!) {
        byStoreId[key] = c;
      }
    }

    const result = Object.values(byStoreId).map((c) => {
      const store = stores.find((s) => s._id === c.storeId);
      return {
        ...c,
        store: store ?? null,
      };
    });

    return result.sort((a, b) => (a.fuelPrice ?? 999) - (b.fuelPrice ?? 999));
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
          { title: "5¢ off per gallon", code: "FUEL5", discount: "5¢ Off", desc: "With Fuel Rewards membership." },
          { title: "10¢ off first fill-up", code: "SHELL10", discount: "10¢ Off", desc: "New members only." },
          { title: "Iowa Special: 15¢ off", code: "IOWA15", discount: "15¢ Off", desc: "Valid only in Iowa Shell stations.", states: ["Iowa"] },
        ],
      },
      {
        store: "ExxonMobil",
        coupons: [
          { title: "6¢ off per gallon", code: "PLUS6", discount: "6¢ Off", desc: "With Rewards+ program." },
          { title: "Extra 5¢ off", code: "LINK5", discount: "5¢ Off", desc: "When linking a credit card." },
        ],
      },
      {
        store: "BP",
        coupons: [
          { title: "5¢ off per gallon", code: "BP5", discount: "5¢ Off", desc: "Driver Rewards members." },
          { title: "Free car wash", code: "BPWASH", discount: "Free", desc: "With 10+ gallon fill-up." },
        ],
      },
      {
        store: "Chevron",
        coupons: [
          { title: "10¢ off per gallon", code: "TEX10", discount: "10¢ Off", desc: "Texaco Rewards members." },
          { title: "2x points on premium", code: "CHEV2X", discount: "2x Points", desc: "Valid all month." },
        ],
      },
      {
        store: "Costco",
        coupons: [
          { title: "$20 Shop Card", code: "COSTCO20", discount: "$20 Back", desc: "New Executive members." },
          { title: "$100 off Furniture", code: "HOME100", discount: "$100 Off", desc: "Select items over $999." },
          { title: "Buy 3 Get 1 Free Tires", code: "TIRES", discount: "B3G1", desc: "Valid on Michelin and Bridgestone." },
        ],
      },
      {
        store: "Sam's Club",
        coupons: [
          { title: "$15 off $50", code: "SAMS15", discount: "$15 Off", desc: "New members only." },
          { title: "Free Rotisserie Chicken", code: "CHICKEN", discount: "Free", desc: "With first pickup order." },
        ],
      },
      {
        store: "Aldi",
        coupons: [
          { title: "$5 off $30", code: "ALDI5", discount: "$5 Off", desc: "Valid on first delivery order." },
        ],
      },
      {
        store: "Trader Joe's",
        coupons: [
          { title: "$2 off Flowers", code: "BLOOM", discount: "$2 Off", desc: "Seasonal bouquets." },
        ],
      },
      {
        store: "Publix",
        coupons: [
          { title: "$5 off $30", code: "PUB5", discount: "$5 Off", desc: "Valid on first delivery." },
          { title: "BOGO Deli Subs", code: "SUB", discount: "BOGO", desc: "Thursday only special." },
        ],
      },
      {
        store: "H&M",
        coupons: [{ title: "20% off one item", code: "HM20", discount: "20% Off", desc: "Join H&M rewards." }],
      },
      {
        store: "Dollar General",
        coupons: [{ title: "$5 off $25", code: "SAVE5", discount: "$5 Off", desc: "Valid every Saturday." }],
      },
      {
        store: "Dollar Tree",
        coupons: [{ title: "Buy 10 Get 1 Free", code: "TREE", discount: "B10G1", desc: "Valid on party supplies." }],
      },
      {
        store: "TJ Maxx",
        coupons: [{ title: "10% off first order", code: "MAXX", discount: "10% Off", desc: "With TJX Rewards card." }],
      },
      {
        store: "Ross",
        coupons: [{ title: "Senior Discount", code: "SENIOR", discount: "10% Off", desc: "Every Tuesday for 55+." }],
      },
      {
        store: "Michaels",
        coupons: [{ title: "20% off regular price", code: "ART20", discount: "20% Off", desc: "Sitewide or in-store." }],
      },
      {
        store: "Petco",
        coupons: [{ title: "$10 off $50", code: "PET10", discount: "$10 Off", desc: "Valid on food and treats." }],
      },
      {
        store: "Office Depot",
        coupons: [{ title: "$15 off $75", code: "OFFICE15", discount: "$15 Off", desc: "Business essentials only." }],
      },
      {
        store: "GameStop",
        coupons: [{ title: "$5 monthly reward", code: "PRO", discount: "$5 Off", desc: "Pro members only." }],
      },
      {
        store: "Starbucks",
        coupons: [
          { title: "BOGO Frappuccino", code: "FRAP", discount: "BOGO", desc: "Happy Hour special 2pm-5pm." },
          { title: "Free Pastry", code: "STAR50", discount: "Free", desc: "With 50 reward stars." },
        ],
      },
      {
        store: "McDonald's",
        coupons: [
          { title: "Free Large Fries", code: "APPFRIES", discount: "Free", desc: "With any $1 purchase in app." },
          { title: "BOGO Big Mac", code: "BOGO", discount: "BOGO", desc: "Limit one per customer." },
        ],
      },
      {
        store: "Chipotle",
        coupons: [{ title: "Free Guac", code: "GUAC", discount: "Free", desc: "With any entree purchase." }],
      },
      {
        store: "Panera Bread",
        coupons: [{ title: "Free Sip Club", code: "DRINK", discount: "Free", desc: "First 2 months free." }],
      },
      {
        store: "AutoZone",
        coupons: [{ title: "$10 off $50", code: "AUTO10", discount: "$10 Off", desc: "Online or in-store." }],
      },
      {
        store: "Dick's Sporting Goods",
        coupons: [{ title: "20% off apparel", code: "DSG20", discount: "20% Off", desc: "Select brands only." }],
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
              // FIX #1: No placeholder barcode — omit entirely
              isManufacturer: false,
              states: (c as any).states,
            });
          }
        }
      }
    }
  },
});
