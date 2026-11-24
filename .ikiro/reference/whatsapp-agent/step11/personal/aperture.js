import { v, Vector } from "@vivalence/typology";

export const aperture = new Vector().open(
  {
    nature: "/settings",
    valence: "what the bot runs on: its owner, its platforms, its silence gap. Example: {}",
    input: v.object({}),
  },
  (ctx) => ({
    user: ctx.mode.statics.user,
    idle: ctx.mode.statics.idle,
    platforms: ctx.mode.statics.platforms,
  }),
);
