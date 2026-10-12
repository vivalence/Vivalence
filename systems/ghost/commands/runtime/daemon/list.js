import { Vector } from "@vivalence/typology";

export const list = new Vector().open(
  { nature: "/daemon", valence: "every daemon of the runtime — reference, status, mode count. Example: /daemon" },
  (ctx) => ctx.runtime.daemons.map((daemon) => ({ reference: daemon.reference.absolute, status: daemon.status.code, modes: daemon.modes.length })),
);
