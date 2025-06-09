export default function (ctx) {
  return {
    tactic: async ({ slug }) => {
      const tactic = await ctx.runtime //
        .call("/modules/tactic/findOne", { where: { slug } });

      tactic.call = ctx.call.wrap(
        `/aperture/v1/runtime/${ctx.runtime.slug}/tactic/${slug}`,
      );
      // `/aperture/v1/runtime/${event.params.runtime}/strategy/${slug}`,

      return tactic;
    },
    strategy: async ({ slug }) => {
      const strategy = await ctx.runtime //
        .call("/modules/strategy/findOne", { where: { slug } });

      strategy.call = ctx.call.wrap(
        `/aperture/v1/runtime/${ctx.runtime.slug}/strategy/${slug}`,
      );
      // `/aperture/v1/runtime/${event.params.runtime}/strategy/${slug}`,

      return strategy;
    },
    game: async ({ slug }) => {
      const game = await ctx.runtime //
        .call("/modules/game/findOne", { where: { slug } });

      // game.call = ctx.runtime.call.wrap(`/game/${slug}`);
      game.call = ctx.call.wrap(
        `/aperture/v1/runtime/${ctx.runtime.slug}/game/${slug}`,
      );

      return game;
    },
  };
}
