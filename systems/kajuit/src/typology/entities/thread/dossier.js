import { RemoteRepository } from "@vivalence/typology";
import { Thread } from "./thread.js";
import * as traits from "../../traits/index.js";
import { applyTraits } from "../../traits/runner.js";
import { wire as wireConversational } from "../../traits/thread/conversational.js";

export const ThreadDossier = {
  name: "thread",
  kind: () => Thread,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/userspace/entities/thread"));
    return repo;
  },

  use: [
    applyTraits(traits.thread),

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
