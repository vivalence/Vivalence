import { fromm } from "@vivalence/typology";
import { card } from "../domain/card.js";

const catalog = (ctx) =>
  Object.assign({}, ...fromm.modes(ctx.modes).flat.filter((mode) => mode.implements("FRAUGHT")).map((mode) => mode.freight.catalog));

export const freighted = (ctx, rows) => {
  const carried = catalog(ctx);
  const url = (path) => (path === null ? null : carried[path].url);
  return rows.map(card).map((held) => ({ ...held, voice: url(held.voice), picture: url(held.picture) }));
};

export const where = (symbols) => (symbols === undefined ? {} : { symbols });

export const deal = async (ctx, { limit, symbols }) => freighted(ctx, await ctx.entities.literal.feed(where(symbols), { limit }));

export const locate = (ctx, slug) => ctx.entities.literal.findOneOrFail({ slug }, { populate: ["notes"], refresh: true });

export const grade = async (ctx, { card: slug, signal, thread }) => {
  await ctx.entities.literal.review(await locate(ctx, slug), { signal, mode: ctx.mode.id, thread });
  const [graded] = freighted(ctx, [await locate(ctx, slug)]);
  return graded;
};
