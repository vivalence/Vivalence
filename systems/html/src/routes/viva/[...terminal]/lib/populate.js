import { goto } from "$app/navigation";
import { Buffer } from "@vivalence/html/typology";
import { Vector, steer, Signal, fromm, is } from "@vivalence/typology";
import { dataspace } from "$client";

export async function populate(terminal, segments) {
  const signal = new Signal(`/${segments}`);
  const [effect, apply, match] = steer.traverse(population, signal);

  if (!effect) return;
  const params = fromm.match(match).parameters;
  const ctx = { terminal, signal, match, params };
  await apply(ctx, async (ctx) => await effect(ctx));
}

function mint(pojo, mode, terminal) {
  const view = mode.buffered ?? null;
  const buffer = Buffer.from(pojo, view);
  buffer.context = { buffer, terminal };
  buffer.release = () => {
    terminal.daemon.entities.buffer.update(buffer.id, {});
    terminal.stall.next();
  };
  if (buffer.id) terminal.daemon.entities.buffer.merge(buffer);
  return buffer;
}

// function mint(pojo, mode, terminal) {
//   const view = mode.buffered ?? null;
//   const buffer = Buffer.from(pojo, view, { terminal });
//   buffer.release = () => {
//     terminal.daemon.entities.buffer.update(buffer.id, {});
//     terminal.stall.next();
//   };
//   if (buffer.id) terminal.daemon.entities.buffer.merge(buffer);
//   return buffer;
// }

const population = new Vector();

population
  .branch("/:lighthouse/:daemon/:type/:mode")
  .use(async (ctx, next) => {
    const daemon = dataspace.daemon.findOneLocal({ slug: ctx.params.daemon });
    if (!daemon) throw new Error(`daemon not found: ${ctx.params.daemon}`);

    const session = await daemon.entities.session.findOne({ id: ctx.params.session });
    if (!session) throw new Error(`session not found: ${ctx.params.session}`);

    ctx.terminal.daemon = daemon;
    ctx.terminal.session = session;
    ctx.terminal.mode = session.mode;
    ctx.terminal.intent = session.intent ?? null;

    await next();
  })
  .open("/:session", async (ctx) => {
    const mode = ctx.terminal.mode;
    const pojo = mode.buffer
      ? { ...mode.buffer(), session: ctx.terminal.session.id }
      : { mode: mode.id, session: ctx.terminal.session.id, data: {} };
    const buffer = mint(pojo, mode, ctx.terminal);
    buffer.release = () => goto("/viva");
    ctx.terminal.stall.push(buffer);
    ctx.terminal.stall.$status.set("IDLE");
  })
  .open("/:intent/:session", async (ctx) => {
    if (ctx.terminal.intent?.type === "APPLICATIVE") {
      ctx.terminal.stall.withPull(async () => {
        const queued = ctx.terminal.stall.queue;
        const blacklist = {
          literals: queued
            .flatMap((b) => b.literals ?? [])
            .map((l) => (typeof l === "object" ? l.id : l)),
        };
        const bufferPojos = await ctx.terminal.intent.emit({
          session: ctx.terminal.session.id,
          blacklist,
        });
        return bufferPojos.map((pojo) => {
          const viewMode = ctx.terminal.daemon.entities.mode.findOneLocal({
            id: is.id(pojo.mode) ? pojo.mode : pojo.mode.id,
          });
          return mint(pojo, viewMode, ctx.terminal);
        });
      });
      ctx.terminal.stall.$status.set("IDLE");
      ctx.terminal.stall.pull();
    } else {
      const mode = ctx.terminal.mode;
      const pojo = mode.buffer
        ? { ...mode.buffer(), session: ctx.terminal.session.id }
        : { mode: mode.id, session: ctx.terminal.session.id, data: {} };
      const buffer = mint(pojo, mode, ctx.terminal);
      ctx.terminal.stall.push(buffer);
      ctx.terminal.stall.$status.set("IDLE");
    }
  });
