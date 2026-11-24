import { v, Vector } from "@vivalence/typology";

export const aperture = new Vector().open(
  {
    nature: "/settings",
    valence: "what the bot runs on: its users, its platforms, its silence gap. Example: {}",
    input: v.object({}),
  },
  (ctx) => ({
    users: ctx.mode.statics.users,
    idle: ctx.mode.statics.idle,
    platforms: ctx.mode.statics.platforms,
  }),
);
