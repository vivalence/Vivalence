import { Vector } from "@vivalence/typology";

export const list = new Vector().open(
  { nature: "/terminal", valence: "every terminal of this user, the active one marked. Example: /terminal" },
  (ctx) =>
    ctx.client.terminals.entities.map((terminal) => ({
      id: terminal.id,
      active: terminal === ctx.terminal,
      label: terminal.label,
      thread: terminal.thread === null ? null : terminal.thread.id,
      mode: terminal.mode === null ? null : terminal.mode.reference.absolute,
    })),
);
