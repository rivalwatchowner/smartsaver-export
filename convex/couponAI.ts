import { mutation, action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { couponAgent } from "./agent";

export const findCouponsForStore = mutation({
  args: { storeName: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { threadId } = await couponAgent.createThread(ctx, {});
    
    const { messageId } = await couponAgent.saveMessage(ctx, {
      threadId,
      prompt: `Find all current coupons and member perks for ${args.storeName}. Use the saveCoupon tool for each one you find.`,
      skipEmbeddings: true,
    });

    await ctx.scheduler.runAfter(0, internal.couponAI.runAgent, {
      threadId,
      messageId,
    });

    return threadId;
  },
});

export const runAgent = internalAction({
  args: { threadId: v.string(), messageId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const result = await couponAgent.streamText(
      ctx,
      { threadId: args.threadId, maxSteps: 24 },
      { promptMessageId: args.messageId }
    );
    await result.consumeStream();
    return null;
  },
});
