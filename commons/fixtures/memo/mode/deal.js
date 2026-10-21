import { card } from "../domain/card.js";

export const filed = async (ctx, rows) => {
  const dealt = rows.map(card);
  const paths = dealt.flatMap((held) => [held.voice, held.picture]).filter((path) => path !== null);
  const files = paths.length ? await ctx.entities.file.find({ path: { $in: paths } }) : [];
  const url = (path) => {
    if (path === null) return null;
    const file = files.find((held) => held.path === path);
    if (file === undefined) throw new Error(`[memo] no File holds ${path} — the topography's FILESET did not record it`);
    return ctx.attach.branch(`/file/${file.id}`).absolute;
  };
  return dealt.map((held) => ({ ...held, voice: url(held.voice), picture: url(held.picture) }));
};

export const where = (symbols) => (symbols === undefined ? {} : { symbols });

export const deal = async (ctx, { limit, symbols }) => filed(ctx, await ctx.entities.literal.feed(where(symbols), { limit }));

export const locate = (ctx, slug) => ctx.entities.literal.findOneOrFail({ slug }, { populate: ["notes"], refresh: true });

export const grade = async (ctx, { card: slug, signal, thread }) => {
  await ctx.entities.literal.review(await locate(ctx, slug), { signal, mode: ctx.mode.id, thread });
  const [graded] = await filed(ctx, [await locate(ctx, slug)]);
  return graded;
};
