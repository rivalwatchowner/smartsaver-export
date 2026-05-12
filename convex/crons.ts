import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";

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

// FIX #3: Gas station fuel deal discovery every 6 hours
// Calls the internal wrapper that fans out to all gas stations
crons.interval(
  "discover-gas-station-deals",
  { hours: 6 },
  internal.publicCoupons.discoverGasStationDealsInternal,
  {}
);

export default crons;
