import { buffer } from "./buffer.js";

const FEED_COUNT = 5;

export const feed = (ctx) =>
  buffer(ctx, {
    set: [
      {
        pick: "feed",
        ...(ctx.input.where ? { where: ctx.input.where } : {}),
        limit: ctx.input.count ?? FEED_COUNT,
      },
    ],
  });
