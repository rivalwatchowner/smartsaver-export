import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Tier 1 stores: Every 6 hours
crons.interval(
  "discover-public-coupons-tier1",
  { hours: 6 },
  internal.publicCoupons.discoverAllStoreCoupons,
  { tier: 1 }
);

// Tier 2 stores: Every 12 hours
crons.interval(
  "discover-public-coupons-tier2",
  { hours: 12 },
  internal.publicCoupons.discoverAllStoreCoupons,
  { tier: 2 }
);

export default crons;
