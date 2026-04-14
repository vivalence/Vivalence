import { atom } from "nanostores";

import { Entity } from "../prototypes/entity.js";
import { traits as threadTraits } from "./thread/traits.js";

export class Thread extends Entity {
  user = null;
  mode = null;
  intent = null;
  phase = "stream";
  traits = ["LABELED"];
  trait = {};
  buffers = [];
  turns = [];
  counter = 0;
  cursor = 0;
  queue = null;
  $buffer = atom(null);
  $label = atom({});

  get label() {
    return this.$label.get();
  }

  set label(value) {
    if (typeof value === "string") value = { name: value };
    this.$label.set({
      name: value?.name
        ?? (this.mode && `${this.mode.type}/${this.mode.name ?? this.mode.slug}`)
        ?? ".unnamed",
      description: value?.description ?? null,
      flags: value?.flags ?? [],
    });
  }
}

export const ThreadDossier = {
  name: "thread",
  kind: () => Thread,
  remote: { endpoint: "/userspace/entities/thread" },

  // cast: async (ctx) => {ctx.entity = await ctx.em.cast(ctx.name, ctx.raw, ctx.schema.kind());},

  use: [
    async (ctx, next) => {
      await next();
      const finalizers = [];
      for (const trait of ctx.entity.traits) {
        const result = await threadTraits[trait]?.(ctx.entity, ctx);
        if (typeof result === "function") finalizers.push(result);
      }
      for (const finalize of finalizers) await finalize();
    },

    async (ctx, next) => {
      await next();
      ctx.entity.daemon = ctx.daemon;

      if (!ctx.entity.traits.includes("LABELED"))
        ctx.entity.traits = [...ctx.entity.traits, "LABELED"];
    },
  ],
};
