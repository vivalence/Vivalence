import { Buffer } from "@vivalence/html/typology";
import { Vector, controller, Context, NotFound } from "@vivalence/vector";
import { is, Signal, Blacklist, fromm } from "@vivalence/typology";

import { dataspace } from "$client";
import { env } from "$env/dynamic/public";
import { replaceState } from "$app/navigation";
import { page } from "$app/stores";
import { get } from "svelte/store";

export async function populate(terminal) {
  // console.log("POPULATE", terminal.perspective);
  const signal = new Signal(terminal.perspective);
  const [effect, apply, match] = controller.traverse(population, signal);

  if (!effect) return;
  const params = fromm.match(match).parameters;
  const ctx = new Context({ terminal, signal, match, params });
  await apply(ctx, async (ctx) => await effect(ctx));
}

const population = new Vector();

population
  .use(async (ctx, next) => {
    // console.log("POPULATION VECTOR", ctx.signal.absolute);
    await next();
  })
  .open("/viva", async (ctx) => {
    const defaultPath = env["PUBLIC_VIVA_CLIENT_HTML_DEFAULT_PERSPECTIVE"];
    const defaultPhase = env["PUBLIC_VIVA_CLIENT_HTML_DEFAULT_PHASE"];

    if (defaultPath) ctx.terminal.perspective = defaultPath;
    if (defaultPhase) ctx.terminal.phase = defaultPhase;
  })

  .branch("/viva")
  .use(async (ctx, next) => {
    ctx.terminal.daemon = await dataspace.daemon.findOne({ slug: ctx.params.daemon });
    if (!ctx.terminal.daemon) throw new Error("daemon not found");
    await next();
  })
  .use(async (ctx, next) => {
    ctx.terminal.mode = await ctx.terminal.daemon.entities.mode.findOne({
      type: ctx.params.type,
      slug: ctx.params.mode,
      daemon: { slug: ctx.params.daemon },
    });

    if (!ctx.terminal.mode) throw new Error("Mode not found");

    await next();
  })
  .use(async (ctx, next) => {
    if (ctx.params.valence)
      ctx.terminal.valence = await ctx.terminal.daemon.entities.valence.findOne({
        slug: ctx.params.valence,
        mode: { id: ctx.terminal.mode.id },
      });

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

    await next();
  })

  .branch("/daemon/:daemon")
  .open("/mode/:type/:mode", async (ctx) => {
    if (!ctx.terminal.mode?.implements("BUFFERED")) throw new Error("non terminal mode");

    const buffer = new Buffer({ terminal: ctx.terminal }, ctx.terminal.mode.view);
    ctx.terminal.stall.push(buffer);
    ctx.terminal.stall.$status.set("IDLE");
  })
  .open("/mode/:type/:mode/valence/:valence", async (ctx) => {
    if (!ctx.terminal.valence) throw new Error("[dataspace] unknown valence");

    if (ctx.terminal.valence.implements("BUFFERED")) {
      const buffer = new Buffer(
        { terminal: ctx.terminal, ...(ctx.terminal.valence.data.BUFFERED || {}) },
        ctx.terminal.mode.view,
      );
      ctx.terminal.stall.push(buffer);
      ctx.terminal.stall.$status.set("IDLE");
    } else if (ctx.terminal.valence.implements("PRODUCTIVE")) {
      ctx.terminal.stall.withPull(async () => {
        const production = await ctx.terminal.valence.produce({
          scope: { session: ctx.terminal.session.id },
        });

        if (production.isClosed) ctx.terminal.stall.$status.set("CLOSED");

        return production.products
          .map((product) => {
            product.release = (callback) => {
              ctx.terminal.daemon //
                .call("/entities/product/nativeUpdate", { id: product.id }, { status: "DONE" });

              ctx.terminal.stall.next(callback);
            };
            return product;
          })
          .map((product) => new Buffer({ terminal: ctx.terminal, product }, product.mode.view));
      });
      ctx.terminal.stall.$status.set("IDLE");
      ctx.terminal.stall.pull();
    }
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
