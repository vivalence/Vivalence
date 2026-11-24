import { Vector } from "@vivalence/typology";

const said = (turn) =>
  turn.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n\n");

export const twitch = new Vector().open("/after/turn/create", async (ctx) => {
  const turn = ctx.input.entity;
  if (turn.role !== "assistant" || turn.mode.id !== ctx.mode.id || !said(turn)) return;
  const [heard] = await ctx.entities.turn.find(
    { thread: turn.thread.id, meta: { provider: { $ne: null } } },
    { orderBy: { createdAt: "DESC" }, limit: 1 },
  );
  if (!heard) return;
  const { platform, from } = heard.meta.provider;
  await ctx.providers[platform].send(from, said(turn));
});
