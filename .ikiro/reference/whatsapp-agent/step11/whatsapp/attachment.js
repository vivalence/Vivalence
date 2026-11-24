import { decodeHex } from "@std/encoding";
import { Vector } from "@vivalence/typology";
import { inbox } from "./provider.js";

const refused = () => new Response(null, { status: 403 });

const signed = async (secret, signature, bytes) =>
  crypto.subtle.verify(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    ),
    decodeHex(signature.slice("sha256=".length)),
    bytes,
  );

const answer = {
  GET: (ctx) =>
    ctx.request.url.query["hub.verify_token"] === ctx.mask.secrets.verify
      ? new Response(ctx.request.url.query["hub.challenge"])
      : refused(),
  POST: async (ctx) => {
    const signature = ctx.request.headers.get("x-hub-signature-256") ?? "";
    const bytes = await ctx.request.bytes();
    const genuine = await signed(ctx.mask.secrets.app, signature, bytes).catch(() => false);
    if (!genuine) return refused();
    inbox.enqueue(ctx.input);
    return new Response(null, { status: 200 });
  },
};

export const attachment = new Vector().open("/webhook", (ctx) => answer[ctx.request.method](ctx));
