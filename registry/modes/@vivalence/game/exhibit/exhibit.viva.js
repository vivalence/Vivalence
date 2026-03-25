import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "exhibit",
  name: "Exhibit",
  description: "Present structured knowledge. Tables, patterns, contrasts. No testing — pure absorption.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER", "SELFEVIDENT"],
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

const emitter = new Vector().open("/present", async (ctx) => {
  return ctx.mode.buffer({
    data: {
      layout: ctx.input.layout ?? "table",
      title: ctx.input.title ?? "",
      subtitle: ctx.input.subtitle,
      template: ctx.input.template,
    },
    literals: ctx.input.literals,
  });
});

const dataset = { intent: [] };

export { manifest, buffer, emitter, dataset };
