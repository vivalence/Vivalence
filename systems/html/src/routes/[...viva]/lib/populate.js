import { Vector, controller, Context, NotFound } from "@vivalence/vector";
import { is, Signal, Blacklist, fromm } from "@vivalence/typology";

import { dataspace } from "$client";
import { env } from "$env/dynamic/public";
import { replaceState } from "$app/navigation";
import { page } from "$app/stores";
import { get } from "svelte/store";

export async function populate(terminal) {
  const signal = new Signal(terminal.perspective);
  const [effect, apply, match] = controller.traverse(population, signal);

  if (!effect) return;
  const params = fromm.match(match).parameters;
  const ctx = new Context({ terminal, signal, match, params });
  await apply(ctx, async (ctx) => await effect(ctx));
}

const population = new Vector();

population
  // .use(async (ctx, next) => {await next();})
  .open("/viva", async (ctx) => {
    const defaultPath = env["PUBLIC_VIVA_CLIENT_HTML_DEFAULT_PERSPECTIVE"];
    const defaultPhase = env["PUBLIC_VIVA_CLIENT_HTML_DEFAULT_PHASE"];

    if (defaultPath) ctx.terminal.perspective = defaultPath;
    if (defaultPhase) ctx.terminal.phase = defaultPhase;
  })

  .branch("/viva")
  .use(async (ctx, next) => {
    ctx.terminal.daemon = await dataspace.daemon.findOne({ slug: ctx.params.daemon });
    if (!ctx.terminal.daemon) return;
    await next();
  })
  .use(async (ctx, next) => {
    ctx.terminal.mode = await ctx.terminal.daemon.entities.mode.findOne({
      type: ctx.params.type,
      slug: ctx.params.mode,
      daemon: { slug: ctx.params.daemon },
    });

    if (!ctx.terminal.mode) return;

    await next();
  })
  .use(async (ctx, next) => {
    const seedId = ctx.terminal._seedSessionId;

    if (seedId) {
      ctx.terminal.session = await ctx.terminal.daemon.entities.session.findOne({ id: seedId });
      ctx.terminal._seedSessionId = null;
    }

    if (!ctx.terminal.session) {
      ctx.terminal.session = await ctx.terminal.daemon.entities.session.create({});
    }

    // ctx.terminal.stall.$cursor.set(ctx.terminal.session.cursor)

    await next();
  })

  .branch("/daemon/:daemon")
  .open("/mode/:type/:mode", async (ctx) => {
    //
  })
  .open("/mode/:type/:mode/valence/:valence", async (ctx) => {
    ctx.terminal.valence = await ctx.terminal.daemon.entities.valence.findOne({
      slug: ctx.params.valence,
      mode: { id: ctx.terminal.mode.id },
    });

    if (!ctx.terminal.valence) throw new Error("[dataspace] unknown valence");
  });

// .use(async (ctx, next) => {
//   const products = ctx.stall.terminals.map((terminal) => terminal.context.product?.id).filter(Boolean);
//   ctx.blacklist = new Blacklist({ products });
//   await next();
// })
// if (is.fn(ctx.terminal.valence.produce)) {
//   const products = await ctx.terminal.valence.produce({
//     scope: { intent: ctx.terminal.intent.id },
//     // blacklist: ctx.blacklist,
//   });
//   return products .map((product) => new Terminal(product.mode.view, { ...ctx, product }));
//   // should be State()
// } else {
//   return [new Terminal(ctx.terminal.mode.view, { ...ctx })];
//   // should be State()
// }
