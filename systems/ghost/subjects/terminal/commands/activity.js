import { Vector } from "@vivalence/typology";

export const activity = new Vector().open(
  { nature: "/activity", valence: "the thread's activities — id · type · status · steps. Example: /activity", chord: "leader/a/a" },
  (ctx) => ctx.terminal.thread.activities.map((held) => ({ id: held.id, type: held.type, status: held.status, steps: held.steps.length })),
);
