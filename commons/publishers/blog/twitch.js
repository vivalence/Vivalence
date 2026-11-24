import { Vector } from "@vivalence/typology";

const sourced = (ctx) =>
  ctx.input.entity.mode?.id === ctx.mode.id && ctx.input.entity.path.startsWith("source/");

const build = async (ctx) => {
  if (sourced(ctx)) await ctx.mode.call.build();
};

export const twitch = new Vector().open("/after/file/create", build).open("/after/file/update", build);
