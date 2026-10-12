import { Vector } from "@vivalence/typology";

export const list = new Vector().open(
  { nature: "/modes", valence: "every mode across the runtime and its daemons — reference, type, slug, traits. Example: /modes" },
  (ctx) =>
    [ctx.runtime.daemon, ...ctx.runtime.daemons]
      .flatMap((host) => host.modes)
      .map((mode) => ({ reference: mode.reference.absolute, type: mode.type, slug: mode.slug, traits: mode.traits, daemon: mode.host.slug })),
);
