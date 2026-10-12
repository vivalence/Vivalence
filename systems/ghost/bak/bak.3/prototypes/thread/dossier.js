import { computed } from "nanostores";
import { RemoteRepository, is } from "@vivalence/typology";
import { Thread, integrity } from "./thread.js";
import * as labeled from "../../traits/thread/labeled.js";

const masks = (mode) =>
  is.object(mode) && mode.implements("APPLICATION") && mode.application !== null && !is.empty(mode.application.schema);

export const ThreadDossier = {
  name: "thread",
  kind: () => Thread,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/thread"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      const thread = ctx.entity;

      thread.$integrity = computed([thread.$traits, thread.$trait, thread.$mode], () => integrity(thread));
      thread.$buffers = computed(ctx.runtime.entities.buffer.$entities, (buffers) => buffers.filter((buffer) => buffer.thread === thread));
      thread.$turns = computed(ctx.runtime.entities.turn.$entities, (turns) =>
        turns
          .filter((turn) => turn.thread === thread)
          .sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt)),
      );

      if (!thread.traits.includes("LABELED")) thread.traits = [...thread.traits, "LABELED"];
      thread.$trait.listen(() => labeled.label(thread));

      thread.$mode.subscribe((mode) => {
        labeled.label(thread);
        const masked = thread.traits.includes("MASKED");
        if (masks(mode) && !masked) thread.traits = [...thread.traits, "MASKED"];
        else if (!masks(mode) && masked) thread.traits = thread.traits.filter((trait) => trait !== "MASKED");
      });
    },
  ],
};
