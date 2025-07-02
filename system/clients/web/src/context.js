import makeModules from "./lib/modules.js";
import load from "./load.js";

async function context(event) {
  const ctx = load(event);

  // if event.route = /
  // user = config.identity.getUser()
  // intent = user.intents({bookmark:{default:true}})
  // forward(intent.resolution.path)

  if (event?.params.runtime) {
    const runtime = event.params.runtime;

    ctx.runtime = {
      slug: runtime,
      call: ctx.call.wrap(`/aperture/v1/runtime/${runtime}`),
    };

    ctx.module = makeModules(ctx);

    if (event?.params.tactic) {
      const slug = event.params.tactic;
      if (ctx.tactic?.manifest.slug !== slug) {
        ctx.tactic = await ctx.module.tactic({ slug });
      }
    }

    if (event?.params.game) {
      // const slug = event.params.game; ctx.game = {slug, call: ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}/game/${slug}`,),};
      const slug = event.params.game;

      if (ctx.game?.manifest.slug !== slug) {
        //         const game = await ctx.runtime //
        //           .call("/modules/game/findOne", { where: { slug } });
        // {...game, call: ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}/game/${slug}`,),}
        ctx.game = await ctx.module.game({ slug });
      }
    }

    if (event?.params.strategy) {
      const slug = event.params.strategy;

      if (ctx.strategy?.manifest?.slug !== slug) {
        ctx.strategy = await ctx.module.strategy({ slug });
        // const strategy = await ctx.runtime .call("/modules/strategy/findOne", { where: { slug } }); ctx.strategy = {...strategy, call: ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}/strategy/${slug}`,),};
      }
    }
  }

  return ctx;
}

export default context;
