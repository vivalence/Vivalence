import { Vector } from "@vivalence/typology";

export const list = new Vector().open(
  { nature: "/modes", valence: "every mode across the runtime and its daemons — reference and traits. Example: /modes" },
  (ctx) => ctx.client.runtime.entities.mode.$entities.get().map((mode) => ({ reference: mode.reference.absolute, traits: mode.traits })),
);
