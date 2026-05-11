import { v } from "convex/values";
import { mutation, action, query, internalAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { couponAgent } from "./agent";
import { auth } from "./auth";

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
    const { threadId } = await couponAgent.createThread(ctx, {});
    await couponAgent.saveMessage(ctx, {
      threadId,
      prompt: `Search ACTIVE coupons at ${args.storeName}. Call savePublicCoupon tool for 3-5 high-quality active deals.`,
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
