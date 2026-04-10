import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "exhibit",
  name: "Exhibit",
  description:
    "Present structured knowledge. Tables, patterns, contrasts. No testing — pure absorption.",
  version: "0.1.0",
  traits: ["BUFFERED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Exhibit.svelte",
  v.buffer({
    data: {
      layout: v.string({ default: "TABLE" }),
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
        layout: ctx.input.layout ?? "TABLE",
        title: ctx.input.title ?? "",
        subtitle: ctx.input.subtitle,
        template: ctx.input.template,
      },
      literals: ctx.input.literals,
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 8;
    const literals = await ctx.daemon.entities.literal.feed(
      ctx.input.where,
      { limit, blacklist: ctx.input.blacklist },
    );
    if (!literals.length) return [];
    return ctx.mode.buffer({
      data: {
        layout: ctx.input.layout ?? "TABLE",
        title: ctx.input.title ?? "",
        subtitle: ctx.input.subtitle,
      },
      literals,
    });
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Exhibit",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/feed",
          queue: 1,
          mask: { limit: 8 },
        },
      },
    },
  ],
};

export { manifest, buffer, emitter, dataset };
