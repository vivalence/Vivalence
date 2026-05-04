import { atom, deepMap } from "nanostores";
import { RemoteRepository } from "@vivalence/typology";

import { traits, Entity } from "@vivalence/kajuit";
import { wire as wireConversational } from "../traits/thread/conversational.js";

export class Thread extends Entity {
  user = null;
  mode = null;
  intent = null;
  counter = 0;

  socket = null;
  streams = null;

  $conversation = atom(null);
  $phase = atom("stream");
  $traits = atom(["LABELED"]);
  $trait = deepMap({});
  $buffer = atom(null);
  $label = atom({});

  get conversation() {
    return this.$conversation.get();
  }
  set conversation(value) {
    this.$conversation.set(value);
  }

  get phase() {
    return this.$phase.get();
  }
  set phase(value) {
    this.$phase.set(value);
  }

  get traits() {
    return this.$traits.get();
  }
  set traits(value) {
    this.$traits.set(value);
  }

  get trait() {
    return this.$trait.get();
  }
  set trait(value) {
    this.$trait.set(value);
  }

  get buffer() {
    return this.$buffer.get();
  }
  set buffer(value) {
    this.$buffer.set(value);
  }

  get label() {
    return this.$label.get();
  }
  set label(value) {
    this.$label.set(value);
  }
}

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
    },

    async (ctx, next) => {
      await next();
      if (!ctx.entity.traits.includes("LABELED"))
        ctx.entity.traits = [...ctx.entity.traits, "LABELED"];
    },

    async (ctx, next) => {
      ctx.entity.daemon = ctx.daemon;
      await next();
    },

    async (ctx, next) => {
      await next();
      const thread = ctx.entity;
      const turnRepo = ctx.daemon?.entities?.turn;
      if (!turnRepo || !thread.id) return;
      try {
        await turnRepo.find(
          { thread: thread.id },
          { orderBy: { createdAt: "ASC" } },
        );
      } catch (error) {
        console.error("[ThreadDossier] turn hydration failed:", error);
      }
    },

    async (ctx, next) => {
      await next();
      wireConversational(ctx.entity);
    },
  ],
};
