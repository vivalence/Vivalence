import { Buffer } from "@vivalence/html/typology";
import { Vector, steer, Context, Signal, fromm } from "@vivalence/typology";

import { lighthouse, dataspace } from "$client";
import { env } from "$env/dynamic/public";

export async function populate(terminal) {
  const signal = new Signal(terminal.perspective);
  const [effect, apply, match] = steer.traverse(population, signal);

  if (!effect) return;
  const params = fromm.match(match).parameters;
  // console.log()
  const ctx = { terminal, signal, match, params };
  await apply(ctx, async (ctx) => await effect(ctx));
}

const population = new Vector();

population
  .use(async (ctx, next) => {
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
    if (ctx.params.intent)
      ctx.terminal.intent = await ctx.terminal.daemon.entities.intent.findOne({
        slug: ctx.params.intent,
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
      const create = { mode: ctx.terminal.mode.id };
      if (ctx.terminal.intent) create.intent = ctx.terminal.intent.id;
      ctx.terminal.session = await ctx.terminal.daemon.entities.session.create(create);
    }

    await next();
  })

  .branch("/daemon/:daemon")
  .open("/mode/:type/:mode", async (ctx) => {
    if (!ctx.terminal.mode?.implements("SELFEVIDENT")) throw new Error("non selfevident mode");

    const pojo = await ctx.terminal.daemon.entities.buffer.create({
      mode: ctx.terminal.mode.id,
      session: ctx.terminal.session.id,
    });
    const buffer = Buffer.hydrate(pojo, ctx.terminal.mode, ctx.terminal);
    ctx.terminal.stall.push(buffer);
    ctx.terminal.stall.$status.set("IDLE");
  })
  .open("/mode/:type/:mode/intent/:intent", async (ctx) => {
    if (!ctx.terminal.intent) throw new Error("[dataspace] unknown intent");

    if (ctx.terminal.intent.type === "SELFEVIDENT") {
      const pojo = await ctx.terminal.daemon.entities.buffer.create({
        mode: ctx.terminal.mode.id,
        session: ctx.terminal.session.id,
        traits: ctx.terminal.intent.traits,
        trait: ctx.terminal.intent.trait,
      });
      const buffer = Buffer.hydrate(pojo, ctx.terminal.mode, ctx.terminal);
      ctx.terminal.stall.push(buffer);
      ctx.terminal.stall.$status.set("IDLE");
    } else if (ctx.terminal.intent.type === "APPLICATIVE") {
      ctx.terminal.stall.withPull(async () => {
        const bufferPojos = await ctx.terminal.intent.emit({
          session: ctx.terminal.session.id,
        });

        return bufferPojos.map((pojo) => {
          const viewMode =
            (typeof pojo.mode === "object" ? pojo.mode : null)
            ?? ctx.terminal.daemon.entities.mode.findOneLocal({ id: pojo.mode })
            ?? ctx.terminal.mode;
          return Buffer.hydrate(pojo, viewMode, ctx.terminal);
        });
      });
      ctx.terminal.stall.$status.set("IDLE");
      ctx.terminal.stall.pull();
    }
  });
