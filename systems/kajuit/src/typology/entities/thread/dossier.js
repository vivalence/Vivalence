import { computed } from "nanostores";
import { RemoteRepository, is } from "@vivalence/typology";
import { Thread } from "./thread.js";
import * as labeled from "./traits/labeled.js";

export const ThreadDossier = {
  name: "thread",
  kind: () => Thread,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/userspace/entities/thread"));
    return repo;
  },

  use: [
    // no run-all resolver: each trait's capability is invoked where its responsibility lives.
    // behavior (AIMED.pull) is imported at its call-sites; markers (QUEUEING) are read live;
    // only LABELED's one-shot normalization belongs here, called explicitly.
    async (ctx, next) => {
      await next();
      const thread = ctx.entity;
      thread.daemon = ctx.daemon;

      thread.$buffers = computed(ctx.daemon.entities.buffer.$entities, (buffers) =>
        buffers.filter((buffer) => (buffer.thread?.id ?? buffer.thread) === thread.id),
      );
      thread.$turns = computed(ctx.daemon.entities.turn.$entities, (turns) =>
        turns
          .filter((turn) => (turn.thread?.id ?? turn.thread) === thread.id)
          .sort((a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)),
      );

      if (!thread.traits.includes("LABELED")) thread.traits = [...thread.traits, "LABELED"];
      labeled.label(thread); // one-shot: derive the display label from intent/mode

      thread.$mode.subscribe((mode, previous) => {
        const shouldMask =
          thread.mode?.implements?.("APPLICATION") && !is.empty(thread.mode?.metadata?.app?.schema);
        const has = thread.traits.includes("MASKED");
        if (shouldMask && !has) thread.traits = [...thread.traits, "MASKED"];
        else if (!shouldMask && has)
          thread.traits = thread.traits.filter((trait) => trait !== "MASKED");
      });

      thread.$mode.subscribe((mode, previous) => {
        if (previous && mode && mode.id !== previous.id)
          ctx.daemon.entities.thread.updateOne({ id: thread.id }, { mode: mode.id });
      });
    },
  ],
};
