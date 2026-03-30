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
    terminal.daemon.entities.buffer.updateOne(buffer.id, {});
    terminal.stall.next();
  };
  if (buffer.id) terminal.daemon.entities.buffer.merge(buffer);
  return buffer;
}

// function mint(pojo, mode, terminal) {
//   const view = mode.buffered ?? null;
//   const buffer = Buffer.from(pojo, view, { terminal });
//   buffer.release = () => {
//     terminal.daemon.entities.buffer.updateOne(buffer.id, {});
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

    const thread = await daemon.entities.thread.findOne({ id: ctx.params.thread });
    if (!thread) throw new Error(`thread not found: ${ctx.params.thread}`);

    ctx.terminal.daemon = daemon;
    ctx.terminal.thread = thread;
    ctx.terminal.mode = thread.mode;
    ctx.terminal.intent = thread.intent ?? null;

    await next();
  })
  .open("/:thread", async (ctx) => {
    const mode = ctx.terminal.mode;
    const pojo = mode.buffer
      ? { ...mode.buffer(), thread: ctx.terminal.thread.id }
      : { mode: mode.id, thread: ctx.terminal.thread.id, data: {} };
    const buffer = mint(pojo, mode, ctx.terminal);
    buffer.release = () => goto("/viva");
    ctx.terminal.stall.push(buffer);
    ctx.terminal.stall.$status.set("IDLE");
  })
  .open("/:intent/:thread", async (ctx) => {
    if (ctx.terminal.intent?.type === "APPLICATIVE") {
      const queue = ctx.terminal.intent.trait?.FEEDING?.queue ?? 0;
      ctx.terminal.stall.withPull(async () => {
        const queued = ctx.terminal.stall.queue;
        const blacklist = {
          literals: queued
            .flatMap((b) => b.literals ?? [])
            .map((l) => (typeof l === "object" ? l.id : l)),
        };
        const bufferPojos = await ctx.terminal.intent.emit({
          thread: ctx.terminal.thread.id,
          blacklist,
        });
        return bufferPojos.map((pojo) => {
          const viewMode = ctx.terminal.daemon.entities.mode.findOneLocal({
            id: is.id(pojo.mode) ? pojo.mode : pojo.mode.id,
          });
          return mint(pojo, viewMode, ctx.terminal);
        });
      }, queue);
      ctx.terminal.stall.$status.set("IDLE");
      ctx.terminal.stall.pull();
    } else {
      const mode = ctx.terminal.mode;
      const pojo = mode.buffer
        ? { ...mode.buffer(), thread: ctx.terminal.thread.id }
        : { mode: mode.id, thread: ctx.terminal.thread.id, data: {} };
      const buffer = mint(pojo, mode, ctx.terminal);
      ctx.terminal.stall.push(buffer);
      ctx.terminal.stall.$status.set("IDLE");
    }
  });
