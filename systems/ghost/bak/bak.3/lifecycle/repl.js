import { Vector, soma } from "@vivalence/typology";
import * as belt from "../gestalten/belt/index.js";
import { dock, doctor, entity, help, key, quit, runtime, yap } from "../commands/index.js";
import { records, reports } from "../commands/paladin/index.js";

export const capturing = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.span.fault(error);
    ctx.output = { refused: ctx.signal.pathname, fault: error.message };
  }
};

export const painting = (surface) => async (ctx, next) => {
  ctx.view = belt.view(surface);
  await next();
  if (!ctx.view.painted && ctx.output !== undefined) await surface.emit("output", ctx.output);
};

export const streaming = async (ctx, next) => {
  await next();
  if (ctx.stream === undefined) return;
  const { thread } = ctx.terminal;
  let live = null;
  try {
    for await (const packet of ctx.stream.packets) {
      live = soma.transcript(live, packet);
      thread.$live.set(live);
    }
  } finally {
    thread.$live.set(null);
    thread.$echo.set(null);
  }
  ctx.output = live.output;
};

export const killing = async (ctx, next) => {
  await next();
  if (ctx.kill !== undefined) await ctx.kill.stdin.SIGTERM();
};

export const helping = async (ctx, next) => {
  if (ctx.signal.flags.help !== true) return next();
  const commands = belt.help.named(belt.help.census(ctx.repl), ctx.signal.pathname.slice(1));
  await ctx.view.emit("listing", belt.help.listing(commands, ctx.flags));
  ctx.output = { commands, flags: ctx.flags };
};

export const execution = new Vector()
  .use(capturing)
  .use(helping)
  .use(streaming)
  .use(killing)
  .graft(runtime, entity, dock, key, quit, help, doctor, reports, records, yap);
