import { belt } from "@vivalence/typology";

export const CONVERSATION = (mode) => {
  for (const op of ["create", "update"])
    mode.twitch.open(`/before/thread/${op}`, (ctx) => {
      const thread = ctx.input.entity;
      if (thread.mode?.id !== mode.id || thread.traits.includes("CONVERSATIONAL")) return;
      const starter = { CONVERSATIONAL: mode.trait.CONVERSATIONAL ?? {} };
      Object.assign(thread, belt.traits.patch(thread, starter));
    });
};

export const CONVERSATIONAL = CONVERSATION; //deprecated
