import { Vector } from "@vivalence/typology";

export const runtime = new Vector().open(
  { nature: "/runtime", valence: "the runtime, its daemons, their standing — host · reference · standing · modes. Example: /runtime", chord: "leader/s/r" },
  (ctx) => [
    { host: "runtime", reference: ctx.client.runtime.reference.absolute, standing: ctx.client.runtime.status.code, modes: ctx.client.runtime.modes.length },
    ...ctx.client.runtime.entities.daemon.$entities.get().map((daemon) => ({ host: "daemon", reference: daemon.reference.absolute, standing: daemon.status.code, modes: daemon.modes.length })),
  ],
);
