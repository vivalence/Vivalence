import { computed } from "nanostores";
import { RemoteRepository } from "@vivalence/typology";
import { Thread } from "./thread.js";
import * as traits from "./traits/index.js";
import { applyTraits } from "../../gestalten/belt/index.js";

export const ThreadDossier = {
  name: "thread",
  kind: () => Thread,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/userspace/entities/thread"));
    return repo;
  },

  use: [
    applyTraits(traits),

    async (ctx, next) => {
      await next();
      const thread = ctx.entity;
      thread.daemon = ctx.daemon;

      const modeId = thread.mode?.id ?? thread.mode;
      thread.mode =
        ctx.daemon.entities.mode.$entities.get().find((mode) => mode.id === modeId) ?? thread.mode;

      if (!thread.traits.includes("LABELED")) thread.traits = [...thread.traits, "LABELED"];
      if (thread.mode?.implements?.("VIEWABLE") && !thread.traits.includes("MASKED"))
        thread.traits = [...thread.traits, "MASKED"];

      thread.$buffers = computed(ctx.daemon.entities.buffer.$entities, (buffers) =>
        buffers.filter((buffer) => (buffer.thread?.id ?? buffer.thread) === thread.id),
      );
    },
  ],
};
