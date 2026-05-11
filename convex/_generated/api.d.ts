/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTP from "../ResendOTP.js";
import type * as admin from "../admin.js";
import type * as agent from "../agent.js";
import type * as auth from "../auth.js";
import type * as cards from "../cards.js";
import type * as couponAI from "../couponAI.js";
import type * as coupons from "../coupons.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lemonSqueezy from "../lemonSqueezy.js";
import type * as loyalty from "../loyalty.js";
import type * as planHelper from "../planHelper.js";
import type * as publicCoupons from "../publicCoupons.js";
import type * as seed from "../seed.js";
import type * as stores from "../stores.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  admin: typeof admin;
  agent: typeof agent;
  auth: typeof auth;
  cards: typeof cards;
  couponAI: typeof couponAI;
  coupons: typeof coupons;
  crons: typeof crons;
  http: typeof http;
  lemonSqueezy: typeof lemonSqueezy;
  loyalty: typeof loyalty;
  planHelper: typeof planHelper;
  publicCoupons: typeof publicCoupons;
  seed: typeof seed;
  stores: typeof stores;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
