import { browser } from "$app/environment";
import makeModules from "./lib/modules.js";
import createCall from "./lib/call.js";
import { Trajectory, parsers } from "@vivalence/trajectory";

let ctx;

async function context(event) {
  if (!ctx) {
    ctx = {
      event,
      state: {},
      locals: {},
      identity: {},
      call: null,
      runtime: null,
      daemon: null,
      // todo: rename vector
      trajectory: new Trajectory([parsers.key]),
    };
    // ctx.client.trajectory.branch((p) => p.key("p"));

    ctx.identity = {
      getUser: async () => await Promise.resolve({ id: "localhost" }),
    };

    ctx.call = createCall({});

    ctx.daemon = { call: ctx.call.wrap("/aperture/v1/daemon") };

    if (browser && !window.viva) {
      window.viva = ctx;
    }
  }

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
