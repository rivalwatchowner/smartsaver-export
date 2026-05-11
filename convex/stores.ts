import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { search: v.optional(v.string()), category: v.optional(v.string()) },
  returns: v.array(
    v.object({
      _id: v.id("stores"),
      _creationTime: v.number(),
      name: v.string(),
      logo: v.optional(v.string()),
      category: v.optional(v.string()),
      memberPerks: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    if (args.search) {
      const searchResults = await ctx.db
        .query("stores")
        .withSearchIndex("search_name", (q) => q.search("name", args.search!))
        .collect();

      if (args.category) {
        return searchResults.filter(
          (s) =>
            s.category?.toLowerCase() === args.category?.toLowerCase()
        );
      }
      return searchResults;
    }

    if (args.category) {
      return await ctx.db
        .query("stores")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    }

    return await ctx.db.query("stores").collect();
  },
});

export const getCoupons = query({
  args: { storeId: v.id("stores") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("coupons")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

// FIX #3: Mutation to ensure all major gas station chains exist in the stores table
export const addMajorGasStations = mutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    const gasStations = [
      { name: "Shell", memberPerks: "Join Shell Fuel Rewards for up to 10¢ off per gallon." },
      { name: "BP", memberPerks: "BPme Rewards members save on every gallon." },
      { name: "Exxon", memberPerks: "Exxon Mobil Rewards+ members earn points on fuel and convenience." },
      { name: "Speedway", memberPerks: "Speedy Rewards members earn points on fuel and in-store purchases." },
      { name: "Sheetz", memberPerks: "MySheetz Card members save on fuel and food." },
      { name: "Wawa", memberPerks: "Wawa Rewards members earn points redeemable for free food and fuel." },
      { name: "Costco Gas", memberPerks: "Costco members get exclusive low fuel prices at Costco gas stations." },
      { name: "Sam's Club Gas", memberPerks: "Sam's Club members save on fuel at Sam's Club gas stations." },
      { name: "Kroger Fuel", memberPerks: "Kroger Plus Card members earn fuel points on grocery purchases." },
      { name: "Safeway Fuel", memberPerks: "Safeway for U members earn fuel rewards on qualifying purchases." },
      { name: "Giant Eagle FuelPerks", memberPerks: "Giant Eagle Advantage Card earns FuelPerks redeemable at GetGo stations." },
    ];

    let inserted = 0;
    let skipped = 0;

    for (const station of gasStations) {
      const existing = await ctx.db
        .query("stores")
        .withIndex("by_name", (q) => q.eq("name", station.name))
        .first();

      if (!existing) {
        await ctx.db.insert("stores", {
          name: station.name,
          category: "Gas",
          memberPerks: station.memberPerks,
        });
        inserted++;
      } else {
        // Ensure category is set to Gas
        if (existing.category !== "Gas") {
          await ctx.db.patch(existing._id, { category: "Gas" });
        }
        skipped++;
      }
    }

    return { inserted, skipped };
  },
});

export const seed = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const categories = {
      grocery: [
        "Target", "Walmart", "Kroger", "Safeway", "Whole Foods", "Costco",
        "Sam's Club", "Aldi", "Trader Joe's", "Publix", "Wegmans", "H-E-B",
        "Giant Eagle", "ShopRite", "Food Lion", "Albertsons", "Vons",
        "Jewel-Osco", "Harris Teeter", "Fred Meyer", "Ralphs", "Smith's",
        "Fry's", "King Soopers", "QFC", "Sprouts Farmers Market",
        "Fresh Thyme Market",
      ],
      pharmacy: ["CVS", "Walgreens", "Rite Aid", "Duane Reade"],
      gas: [
        "Shell", "ExxonMobil", "BP", "Chevron", "Texaco", "Marathon",
        "Speedway", "Circle K", "7-Eleven", "Wawa", "Sheetz", "QuikTrip",
        "RaceTrac", "Murphy USA", "Pilot Flying J", "Love's Travel Stops",
        "Casey's General Store", "Phillips 66", "Valero", "Sunoco", "Arco",
        "Gulf", "Conoco", "Citgo", "GetGo", "Costco Gas", "Sam's Club Gas",
        "BJ's Gas", "Kroger Fuel Center", "GasBuddy", "Upside",
        // FIX #3 additions
        "Exxon", "Kroger Fuel", "Safeway Fuel", "Giant Eagle FuelPerks",
      ],
      department: [
        "Macy's", "Kohl's", "JCPenney", "Nordstrom", "Dillard's", "Belk",
        "Bloomingdale's", "Neiman Marcus", "Saks Fifth Avenue", "Von Maur",
      ],
      apparel: [
        "Old Navy", "Gap", "H&M", "Zara", "Forever 21", "American Eagle",
        "Hollister", "Abercrombie & Fitch", "Express", "Banana Republic",
        "J.Crew", "Ann Taylor", "LOFT", "Chico's", "Talbots", "Lands' End",
        "L.L.Bean", "Eddie Bauer", "The North Face", "Patagonia", "Columbia",
        "REI", "Dick's Sporting Goods", "Academy Sports", "Finish Line",
        "Foot Locker", "Famous Footwear", "DSW", "Rack Room Shoes",
      ],
      home: [
        "Home Depot", "Lowe's", "Bed Bath & Beyond", "Menards", "Ace Hardware",
        "True Value", "Harbor Freight", "IKEA", "Ashley Furniture",
        "Rooms To Go", "Wayfair", "Overstock", "Pier 1 Imports", "HomeGoods",
        "At Home", "West Elm", "Pottery Barn", "Williams Sonoma",
        "Crate & Barrel", "CB2",
      ],
      electronics: [
        "Best Buy", "Amazon", "B&H Photo", "Newegg", "Micro Center",
        "Apple Store", "Microsoft Store", "GameStop", "Dell", "HP", "Lenovo",
      ],
      beauty: [
        "Ulta", "Sephora", "Sally Beauty", "Beauty Brands", "Bluemercury",
        "MAC Cosmetics", "Bath & Body Works", "The Body Shop", "Lush",
      ],
      office: [
        "Office Depot", "OfficeMax", "Staples", "Michaels", "Joann Fabrics",
        "Hobby Lobby",
      ],
      pets: [
        "Petco", "PetSmart", "Pet Supplies Plus", "Tractor Supply Co.",
        "Chewy",
      ],
      discount: [
        "Dollar General", "Dollar Tree", "Family Dollar", "Five Below",
        "Big Lots", "TJ Maxx", "Marshalls", "Ross Dress for Less",
        "Burlington",
      ],
      books: ["Barnes & Noble", "Books-A-Million", "Half Price Books"],
      baby: [
        "Buy Buy Baby", "Carter's", "OshKosh B'gosh", "The Children's Place",
      ],
      restaurants: [
        "McDonald's", "Burger King", "Wendy's", "Taco Bell", "Subway",
        "Chipotle", "Panera Bread", "Starbucks", "Dunkin'", "Pizza Hut",
        "Domino's", "Papa John's", "Olive Garden", "Red Lobster",
        "Applebee's", "Chili's", "TGI Fridays", "Buffalo Wild Wings",
        "DoorDash", "Uber Eats", "Grubhub",
      ],
      online: ["eBay", "Etsy", "Wish", "AliExpress", "Shein", "Temu", "Zappos"],
      automotive: [
        "AutoZone", "O'Reilly Auto Parts", "Advance Auto Parts",
        "NAPA Auto Parts", "Pep Boys", "Jiffy Lube", "Firestone",
      ],
      specialty: [
        "Vitamin Shoppe", "GNC", "Container Store", "The UPS Store",
        "FedEx Office", "Party City", "Spencer's", "American Greetings",
        "Hallmark",
      ],
    };

    const allStores: { name: string; category: string }[] = [];
    Object.entries(categories).forEach(([category, stores]) => {
      stores.forEach((name) => {
        allStores.push({ name, category });
      });
    });

    for (const { name, category } of allStores) {
      const existing = await ctx.db
        .query("stores")
        .withIndex("by_name", (q) => q.eq("name", name))
        .first();

      if (!existing) {
        await ctx.db.insert("stores", {
          name,
          category,
          memberPerks: `Join ${name} rewards for exclusive savings and member-only deals.`,
        });
      } else if (!existing.category) {
        await ctx.db.patch(existing._id, { category });
      }
    }

    return null;
  },
});
