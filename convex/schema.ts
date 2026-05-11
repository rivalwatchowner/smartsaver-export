import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    ...authTables.users.validator.fields,
    plan: v.optional(v.string()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    role: v.optional(v.string()),
    state: v.optional(v.string()),
    stateCode: v.optional(v.string()),
    zipCode: v.optional(v.string()),
  }).index("email", ["email"]).index("phone", ["phone"]),

  merchantConfig: defineTable({
    lemonSqueezyStoreId: v.string(),
    apiKey: v.string(),
    webhookSecret: v.string(),
    testMode: v.boolean(),
  }),

  subscriptions: defineTable({
    userId: v.id("users"),
    planId: v.string(),
    lemonSqueezyId: v.string(),
    orderId: v.optional(v.string()),
    status: v.string(),
    renewsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_lemon_squeezy_id", ["lemonSqueezyId"]),

  revenueSnapshots: defineTable({
    date: v.string(),
    revenue: v.number(),
    mrr: v.number(),
    activeSubscriptions: v.number(),
    churnedCount: v.number(),
    newSignups: v.number(),
  }).index("by_date", ["date"]),

  auditLogs: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    targetId: v.optional(v.string()),
    details: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  payments: defineTable({
    userId: v.id("users"),
    lemonSqueezyId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    planId: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]).index("by_created_at", ["createdAt"]),

  stores: defineTable({
    name: v.string(),
    logo: v.optional(v.string()),
    category: v.optional(v.string()),
    memberPerks: v.optional(v.string()),
  }).index("by_name", ["name"]).index("by_category", ["category"]).searchIndex("search_name", { searchField: "name" }),

  coupons: defineTable({
    storeId: v.id("stores"),
    title: v.string(),
    description: v.string(),
    discount: v.string(),
    originalPrice: v.optional(v.number()),
    discountedPrice: v.optional(v.number()),
    category: v.string(),
    expiresAt: v.string(),
    barcode: v.optional(v.string()),
    barcodeFormat: v.optional(v.string()),
  }).index("by_store", ["storeId"]),

  creditCards: defineTable({
    name: v.string(),
    issuer: v.string(),
    logoUrl: v.string(),
    annualFee: v.number(),
    baseRate: v.number(),
    categories: v.array(v.object({ name: v.string(), rate: v.number() })),
    rotatingCategories: v.optional(v.array(v.object({ quarter: v.number(), year: v.number(), name: v.string(), rate: v.number() }))),
    storeBonuses: v.optional(v.array(v.object({ storeId: v.optional(v.id("stores")), storeName: v.optional(v.string()), rate: v.number() }))),
    pointValueMultiplier: v.number(),
  }).index("by_name", ["name"]),

  userCards: defineTable({
    userId: v.id("users"),
    cardId: v.id("creditCards"),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    dateAdded: v.number(),
  }).index("by_user", ["userId"]),

  cardEarnings: defineTable({
    userId: v.id("users"),
    cardId: v.id("creditCards"),
    storeId: v.optional(v.id("stores")),
    amount: v.number(),
    points: v.number(),
    estimatedValue: v.number(),
    date: v.number(),
  }).index("by_user", ["userId"]).index("by_card", ["cardId"]),

  publicCoupons: defineTable({
    storeName: v.string(),
    storeId: v.optional(v.id("stores")),
    brandName: v.optional(v.string()),
    isManufacturer: v.optional(v.boolean()),
    title: v.string(),
    description: v.string(),
    code: v.string(),
    discount: v.string(),
    discountAmount: v.optional(v.number()),
    barcode: v.optional(v.string()),
    expiresAt: v.string(),
    terms: v.optional(v.string()),
    category: v.string(),
    sourceUrl: v.optional(v.string()),
    states: v.optional(v.array(v.string())),
    discoveredAt: v.number(),
    isActive: v.boolean(),
    verifiedCount: v.number(),
    // FIX #3: Gas station fuel tracking fields
    fuelPrice: v.optional(v.number()),
    fuelType: v.optional(v.union(
      v.literal("Regular"),
      v.literal("Midgrade"),
      v.literal("Premium"),
      v.literal("Diesel"),
    )),
    fuelDiscountCents: v.optional(v.number()),
    loyaltyProgram: v.optional(v.string()),
  }).index("by_store", ["storeId"]).index("by_active", ["isActive", "expiresAt"]),

  clippedCoupons: defineTable({
    userId: v.id("users"),
    publicCouponId: v.id("publicCoupons"),
    clippedAt: v.number(),
    used: v.boolean(),
    usedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_coupon", ["publicCouponId"]).index("by_user_and_coupon", ["userId", "publicCouponId"]),

  linkedLoyaltyAccounts: defineTable({
    userId: v.id("users"),
    storeId: v.id("stores"),
    storeName: v.string(),
    loyaltyProgramName: v.string(),
    accountIdentifier: v.string(),
    pointsBalance: v.number(),
    cashbackBalance: v.number(),
    tier: v.optional(v.string()),
    expiringPoints: v.optional(v.number()),
    expirationDate: v.optional(v.string()),
    linkedAt: v.number(),
    lastSynced: v.number(),
    isActive: v.optional(v.boolean()),
  }).index("by_user", ["userId"]).index("by_store", ["storeId"]).index("by_user_and_store", ["userId", "storeId"]),

  loyaltyTransactions: defineTable({
    linkedAccountId: v.id("linkedLoyaltyAccounts"),
    userId: v.id("users"),
    transactionDate: v.number(),
    pointsEarned: v.number(),
    pointsRedeemed: v.number(),
    description: v.string(),
    location: v.optional(v.string()),
  }).index("by_account", ["linkedAccountId"]).index("by_user", ["userId"]),
});
