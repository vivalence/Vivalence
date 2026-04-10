import { Entity } from "../prototypes/entity.js";
import { Buffer } from "./buffer.js";
import { Stall } from "../prototypes/stall.js";
import { atom } from "nanostores";

export class Thread extends Entity {
  user = null;
  mode = null;
  intent = null;
  phase = "stream";
  traits = [];
  trait = {};
  buffers = [];
  turns = [];
  counter = 0;
  cursor = 0;
  queue = null;
  $buffer = atom(null);
}

export const ThreadSchema = {
  name: "thread",
  kind: () => Thread,
  remote: { endpoint: "/userspace/entities/thread" },

  use: [
    async (ctx, next) => {
      await next();
      for (const trait of ctx.entity.traits ?? []) {
        threadTraits[trait]?.(ctx.entity, ctx);
      }
    },

    async (ctx, next) => {
      await next();
      if (Array.isArray(ctx.entity.buffers)) {
        ctx.entity.buffers = ctx.entity.buffers
          .map((buffer) => {
            if (typeof buffer === "object" && buffer.id)
              return ctx.daemon.entities.buffer.merge(buffer) ?? buffer;
            if (typeof buffer === "string")
              return ctx.daemon.entities.buffer.findOneLocal({ id: buffer }) ?? buffer;
            return buffer;
          })
          .filter(Boolean);
      }
    },

    async (ctx, next) => {
      await next();
      ctx.entity.daemon = ctx.daemon;
      if (ctx.entity.mode)
        ctx.entity.mode =
          ctx.daemon.entities.mode.findOneLocal({
            id: ctx.entity.mode?.id ?? ctx.entity.mode,
          }) ?? ctx.entity.mode;
      if (ctx.entity.intent)
        ctx.entity.intent =
          ctx.daemon.entities.intent.findOneLocal({
            id: ctx.entity.intent?.id ?? ctx.entity.intent,
          }) ?? ctx.entity.intent;
    },
  ],
};

function mint(pojo, thread) {
  const modeRepo = thread.daemon.entities.mode;
  const modeId = typeof pojo.mode === "object" ? pojo.mode.id : pojo.mode;
  const mode = modeRepo.findOneLocal({ id: modeId }) ?? pojo.mode;
  const view = mode?.buffered ?? null;
  const buffer = Buffer.from(pojo, view);
  buffer.context = { buffer, terminal: thread };
  buffer.on.release(() => thread.queue.next());
  if (buffer.id) thread.daemon.entities.buffer.merge(buffer);
  return buffer;
}

const threadTraits = {
  QUEUEING(thread, ctx) {
    const config = thread.trait.QUEUEING;
    thread.$buffers = atom(thread.buffers ?? []);
    thread.queue = new Stall(thread.$buffers, thread.$buffer);

    const emit = thread.mode.connection.aim(config.mount, {
      thread: thread.id,
      ...(config.mask ?? {}),
    });

    thread.queue.withPull(async () => {
      const queued = thread.$buffers.get();
      const active = thread.queue.$active.get();
      const blacklist = { buffers: [active, ...queued].filter(Boolean).map((b) => b.id).filter(Boolean) };

      const result = await emit({ blacklist });
      const buffers = (result.buffers ?? []).map((pojo) => mint(pojo, thread));
      buffers.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      thread.$buffers.set([...thread.$buffers.get(), ...buffers]);

      if (!thread.queue.$active.get() && thread.$buffers.get().length) {
        const [first, ...rest] = thread.$buffers.get();
        thread.$buffers.set(rest);
        thread.queue.$active.set(first);
      }

      return { buffers, condition: buffers.length ? "NOMINAL" : "EXHAUSTED" };
    }, config.queue ?? 1);

    thread.queue.$status.subscribe((status) => {
      if (status !== "IDLE") return;
      if (!thread.queue.$active.get()) thread.queue.pull();
      if (thread.$buffers.get().length < (config.queue ?? 1)) thread.queue.pull();
    });
  },
};
