import { belt, Vector } from "@vivalence/typology";

export const PRIMER = (mode) => {
  if (!mode.module.primer) throw new Error(`PRIMER: ${mode.manifest.slug} declares the trait and exports no primer`);
  mode.primer = new Vector().graft(mode.module.primer);
  for (const op of ["create", "update"])
    mode.twitch.open(`/before/thread/${op}`, (ctx) => {
      const thread = ctx.input.entity;
      if (thread.mode?.id !== mode.id || thread.traits.includes("PRIMED")) return;
      const starter = { PRIMED: mode.trait.PRIMED ?? {} };
      Object.assign(thread, belt.traits.patch(thread, starter));
    });
};
