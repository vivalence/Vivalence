import { RemoteRepository } from "@vivalence/typology";
import { Thread } from "./thread.js";
import { Buffer } from "../buffer.js";
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

    async (ctx, next) => {
      await next();
      const thread = ctx.entity;
      const modeId = thread.mode?.id ?? thread.mode;
      const mode = thread.daemon?.entities?.mode?.$entities.get().find((m) => m.id === modeId);
      if (!mode?.implements?.("selfevident") || !mode.buffer || thread.$buffer.get()) return;

      const buffer = Buffer.from(mode.buffer(), mode.buffered);
      buffer.context = { buffer, terminal: thread };
      buffer.status = "ACTIVE";
      thread.$buffer.set(buffer);
    },
  ],
};
