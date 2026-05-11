import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { search: v.optional(v.string()), category: v.optional(v.string()) },
  returns: v.array(v.object({
    _id: v.id("stores"),
    _creationTime: v.number(),
    name: v.string(),
    logo: v.optional(v.string()),
    category: v.optional(v.string()),
    memberPerks: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    if (args.search) {
      const searchResults = await ctx.db
        .query("stores")
        .withSearchIndex("search_name", (q) => q.search("name", args.search!))
        .collect();
      
      if (args.category) {
        return searchResults.filter(s => s.category?.toLowerCase() === args.category?.toLowerCase());
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

export const seed = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const categories = {
      grocery: [
        "Target", "Walmart", "Kroger", "Safeway", "Whole Foods", "Costco", "Sam's Club", "Aldi", "Trader Joe's", 
        "Publix", "Wegmans", "H-E-B", "Giant Eagle", "ShopRite", "Food Lion", "Albertsons", "Vons", "Jewel-Osco", 
        "Harris Teeter", "Fred Meyer", "Ralphs", "Smith's", "Fry's", "King Soopers", "QFC", "Sprouts Farmers Market", 
        "Fresh Thyme Market"
      ],
      pharmacy: ["CVS", "Walgreens", "Rite Aid", "Duane Reade"],
      gas: [
        "Shell", "ExxonMobil", "BP", "Chevron", "Texaco", "Marathon", "Speedway", "Circle K", "7-Eleven", "Wawa", 
        "Sheetz", "QuikTrip", "RaceTrac", "Murphy USA", "Pilot Flying J", "Love's Travel Stops", "Casey's General Store", 
        "Phillips 66", "Valero", "Sunoco", "Arco", "Gulf", "Conoco", "Citgo", "GetGo", "Costco Gas", "Sam's Club Gas", 
        "BJ's Gas", "Kroger Fuel Center", "GasBuddy", "Upside"
      ],
      department: ["Macy's", "Kohl's", "JCPenney", "Nordstrom", "Dillard's", "Belk", "Bloomingdale's", "Neiman Marcus", "Saks Fifth Avenue", "Von Maur"],
      apparel: [
        "Old Navy", "Gap", "H&M", "Zara", "Forever 21", "American Eagle", "Hollister", "Abercrombie & Fitch", "Express", 
        "Banana Republic", "J.Crew", "Ann Taylor", "LOFT", "Chico's", "Talbots", "Lands' End", "L.L.Bean", "Eddie Bauer", 
        "The North Face", "Patagonia", "Columbia", "REI", "Dick's Sporting Goods", "Academy Sports", "Finish Line", 
        "Foot Locker", "Famous Footwear", "DSW", "Rack Room Shoes"
      ],
      home: [
        "Home Depot", "Lowe's", "Bed Bath & Beyond", "Menards", "Ace Hardware", "True Value", "Harbor Freight", "IKEA", 
        "Ashley Furniture", "Rooms To Go", "Wayfair", "Overstock", "Pier 1 Imports", "HomeGoods", "At Home", "West Elm", 
        "Pottery Barn", "Williams Sonoma", "Crate & Barrel", "CB2"
      ],
      electronics: ["Best Buy", "Amazon", "B&H Photo", "Newegg", "Micro Center", "Apple Store", "Microsoft Store", "GameStop", "Dell", "HP", "Lenovo"],
      beauty: ["Ulta", "Sephora", "Sally Beauty", "Beauty Brands", "Bluemercury", "MAC Cosmetics", "Bath & Body Works", "The Body Shop", "Lush"],
      office: ["Office Depot", "OfficeMax", "Staples", "Michaels", "Joann Fabrics", "Hobby Lobby"],
      pets: ["Petco", "PetSmart", "Pet Supplies Plus", "Tractor Supply Co.", "Chewy"],
      discount: ["Dollar General", "Dollar Tree", "Family Dollar", "Five Below", "Big Lots", "TJ Maxx", "Marshalls", "Ross Dress for Less", "Burlington"],
      books: ["Barnes & Noble", "Books-A-Million", "Half Price Books"],
      baby: ["Buy Buy Baby", "Carter's", "OshKosh B'gosh", "The Children's Place"],
      restaurants: [
        "McDonald's", "Burger King", "Wendy's", "Taco Bell", "Subway", "Chipotle", "Panera Bread", "Starbucks", "Dunkin'", 
        "Pizza Hut", "Domino's", "Papa John's", "Olive Garden", "Red Lobster", "Applebee's", "Chili's", "TGI Fridays", 
        "Buffalo Wild Wings", "DoorDash", "Uber Eats", "Grubhub"
      ],
      online: ["eBay", "Etsy", "Wish", "AliExpress", "Shein", "Temu", "Zappos"],
      automotive: ["AutoZone", "O'Reilly Auto Parts", "Advance Auto Parts", "NAPA Auto Parts", "Pep Boys", "Jiffy Lube", "Firestone"],
      specialty: ["Vitamin Shoppe", "GNC", "Container Store", "The UPS Store", "FedEx Office", "Party City", "Spencer's", "American Greetings", "Hallmark"]
    };

    const allStores: { name: string, category: string }[] = [];
    Object.entries(categories).forEach(([category, stores]) => {
      stores.forEach(name => {
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
