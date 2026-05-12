import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export const listAll = query({
  args: {},
  returns: v.array(
    v.object({
      store: v.any(),
      coupons: v.array(v.any()),
    })
  ),
  handler: async (ctx) => {
    const coupons = await ctx.db.query("coupons").collect();
    const stores = await ctx.db.query("stores").collect();

    const grouped: Record<
      string,
      { store: Doc<"stores">; coupons: Doc<"coupons">[] }
    > = {};

    for (const store of stores) {
      grouped[store._id] = {
        store,
        coupons: coupons.filter((c) => c.storeId === store._id),
      };
    }

    return Object.values(grouped).filter((g) => g.coupons.length > 0);
  },
});
