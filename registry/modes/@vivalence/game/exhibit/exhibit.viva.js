import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "exhibit",
  name: "Exhibit",
  description: "Present structured knowledge. Tables, patterns, contrasts. No testing — pure absorption.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Exhibit.svelte",
  v.buffer({
    data: {
      layout: v.string({ default: "table" }),
      title: v.string({ default: "" }),
      subtitle: v.string().optional(),
      template: v.string().optional(),
    },
  }),
);

const emitter = new Vector()
  .open("/present", async (ctx) => {
    return ctx.mode.buffer({
      data: {
        layout: ctx.input.layout ?? "table",
        title: ctx.input.title ?? "",
        subtitle: ctx.input.subtitle,
        template: ctx.input.template,
      },
      literals: ctx.input.literals,
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 8;
    const literals = await ctx.daemon.entities.literal.feed({
      limit,
      blacklist: ctx.input.blacklist,
      where: ctx.input.where,
    });
    if (!literals.length) return [];
    return ctx.mode.buffer({
      data: {
        layout: ctx.input.defaults?.layout ?? "table",
        title: ctx.input.defaults?.title ?? "",
        subtitle: ctx.input.defaults?.subtitle,
      },
      literals,
    });
  });

const dataset = {
  intent: [{
    slug: "feed",
    name: "Exhibit",
    type: "APPLICATIVE",
    traits: ["FEEDING"],
    trait: {
      FEEDING: {
        mount: "/emit/feed",
        queue: 1,
        mask: { limit: 8 },
      },
    },
  }],
};

export { manifest, buffer, emitter, dataset };
