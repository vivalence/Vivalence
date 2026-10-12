import { Vector } from "@vivalence/typology";

export const list = new Vector().open(
  { nature: "/thread", valence: "every thread of this user, the seated one marked. Example: /thread" },
  (ctx) =>
    ctx.runtime.entities.thread.$entities.get().map((thread) => ({
      id: thread.id,
      seated: ctx.terminal !== null && ctx.terminal.thread === thread,
      label: thread.label,
      mode: thread.mode === null ? null : thread.mode.reference.absolute,
    })),
);
