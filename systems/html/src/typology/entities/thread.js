import { atom } from "nanostores";
import { RemoteRepository } from "@vivalence/typology";

import { traits, Entity } from "@vivalence/html";

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
  cursor = 0; // LEGACY transition to buffer.id.

  queue = null; // LEGACY to be absorbed into the buffer repository - stall abstraction.

  $buffer = atom(null); // rename $cursor?
  $label = atom({});
  // ?$status?

  get label() {
    return this.$label.get();
  }
  set label(value) {
    if (typeof value === "string") value = { name: value };
    this.$label.set({
      name:
        value?.name ??
        (this.mode && `${this.mode.type}/${this.mode.name ?? this.mode.slug}`) ??
        ".unnamed",
      description: value?.description ?? null,
      flags: value?.flags ?? [],
    });
  }
}

let counter = 0;
export const ThreadDossier = {
  name: "thread",
  kind: () => Thread,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/userspace/entities/thread"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      const finalizers = [];
      for (const trait of ctx.entity.traits) {
        const result = await traits.thread[trait]?.(ctx.entity, ctx);
        if (typeof result === "function") finalizers.push(result);
      }
      for (const finalize of finalizers) await finalize();
      // can we refactor this to await the same set of promises twice?
    },

    // async (ctx, next) => {
    //   await next();
    //   // if (ctx.entity.mode?.traits?.includes("CONVERSATIONAL")) {if (!is.object(ctx.entity.trait["INSITU"])) {ctx.entity.trait.INSITU = {};}}
    // },

    async (ctx, next) => {
      await next();
      if (!ctx.entity.traits.includes("LABELED"))
        ctx.entity.traits = [...ctx.entity.traits, "LABELED"];
    },

    async (ctx, next) => {
      await next();
      // console.log("daemon", counter++, ctx.entity);
      ctx.entity.daemon = ctx.daemon;
    },
  ],
};
