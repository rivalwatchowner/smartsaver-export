import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/lemonsqueezy/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.text();
    const signature = req.headers.get("x-signature");
    
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    try {
      const result = await ctx.runAction(internal.lemonSqueezy.handleWebhook, {
        body,
        signature,
      });
      
      if (result.success) {
        return new Response("OK", { status: 200 });
      } else {
        return new Response(result.error, { status: 400 });
      }
    } catch (err) {
      console.error(err);
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

export default http;
