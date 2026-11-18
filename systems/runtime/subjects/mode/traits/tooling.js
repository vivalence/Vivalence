import { belt } from "@vivalence/typology";

export const TOOLING = (mode) => {
  for (const op of ["create", "update"])
    mode.twitch.open(`/before/thread/${op}`, (ctx) => {
      const thread = ctx.input.entity;
      if (thread.mode?.id !== mode.id || thread.traits.includes("TOOLED")) return;
      const starter = { TOOLED: mode.trait.TOOLED ?? {} };
      Object.assign(thread, belt.traits.patch(thread, starter));
    });
  if (!mode.module.tools) return;
  mode.tools.graft(mode.module.tools);
};
