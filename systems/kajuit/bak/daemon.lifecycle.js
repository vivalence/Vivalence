export { Daemon } from "../prototypes/daemon.js";
export { Dataspace } from "../prototypes/dataspace.js";

import { Path, is } from "@vivalence/typology";
import { Dataspace } from "../prototypes/dataspace.js";
import * as threadTraits from "../traits/thread.js";

export async function construct(daemon) {
  const [manifest, schema, cargo] = await Promise.all([
    daemon.connection.call("/manifest"),
    daemon.connection.call("/datamap"),
    daemon.connection.call("/cargo"),
  ]);

  daemon.manifest = manifest;
  daemon.mount = new Path(`/daemon/${manifest.slug}`);
  daemon.cargo = cargo;
  daemon.schema = schema;
  daemon.call = daemon.connection.call.bind(daemon.connection);
  daemon.link = new Path(`/${daemon.lighthouse.manifest.slug}/${manifest.slug}`).rebase("/viva");
}

export async function populate(daemon) {
  daemon.entities = new Dataspace(daemon, daemon.schema, {
    mode: "/entities/mode",
    intent: "/entities/intent",
    thread: "/userspace/entities/thread",
    buffer: "/userspace/entities/buffer",
    trace: "/userspace/entities/trace",
    literal: "/entities/literal",
  });

  await daemon.entities.populate(["mode", "intent"]);
}

export async function resolve(daemon) {
  const modeRepo = daemon.entities.mode;
  const intentRepo = daemon.entities.intent;

  for (const mode of modeRepo.$entities.get()) {
    mode.daemon = daemon;
    mode.mount = daemon.mount.branch(`/mode/${mode.type}/${mode.slug}`);
    mode.connection = daemon.connection.branch(mode.mount.nature);
    mode.call = mode.connection.call.bind(mode.connection);
    mode.link = daemon.link.branch(`/${mode.type}/${mode.slug}`);
    mode.intents = new Set();

    if (mode.implements("BUFFERED")) {
      mode.buffered = await mode.connection.call("/buffered");
      mode.buffer = (desc = {}) => ({
        mode: mode.id,
        data: { ...(mode.buffered?.schema?.data ?? {}), ...(desc.data ?? {}) },
        literals: desc.literals ?? [],
        symbols: desc.symbols ?? [],
      });
    }
  }

  for (const intent of intentRepo.$entities.get()) {
    const mode =
      typeof intent.mode === "object" ? intent.mode : modeRepo.findOneLocal({ id: intent.mode });
    if (!mode) throw new Error("Intent's mode not found");
    intent.mode = mode;
    intent.link = mode.link.branch(`/${intent.slug}`);

    if (intent.traits?.includes("QUEUEING") && intent.trait?.QUEUEING) {
      intent.emit = mode.connection
        .clone()
        .use(async (context, next) => {
          await next();
          const body = context.response.body;
          if (body?.buffers) {
            body.buffers = body.buffers.map((pojo) => {
              pojo.mode =
                modeRepo.findOneLocal({ id: is.id(pojo.mode) ? pojo.mode : pojo.mode?.id }) ??
                pojo.mode;
              return pojo;
            });
          }
        })
        .aim(intent.trait.QUEUEING.mount, {
          intent: intent.id,
          ...(intent.trait.QUEUEING.mask ?? {}),
        });
    }

    mode.intents.add(intent);
  }

  modeRepo.resolve = (mode) => {
    const enriched = modeRepo.findOneLocal({ id: mode.id });
    if (enriched && enriched !== mode) Object.assign(mode, enriched);
  };

  intentRepo.resolve = (intent) => {
    const mode =
      typeof intent.mode === "object" ? intent.mode : modeRepo.findOneLocal({ id: intent.mode });
    if (mode) intent.mode = mode;
  };

  daemon.entities.thread.resolve = (thread) => {
    thread.daemon = daemon;
    const mode =
      typeof thread.mode === "object" ? thread.mode : modeRepo.findOneLocal({ id: thread.mode });
    if (mode) thread.mode = mode;
    if (thread.intent) {
      const intent =
        typeof thread.intent === "object"
          ? thread.intent
          : intentRepo.findOneLocal({ id: thread.intent });
      if (intent) thread.intent = intent;
    }
    // turns

    const bufferRepo = daemon.entities.buffer;
    if (Array.isArray(thread.buffers)) {
      thread.buffers = thread.buffers
        .map((buffer) => {
          if (typeof buffer === "object" && buffer.id) return bufferRepo.merge(buffer) ?? buffer;
          if (typeof buffer === "string") return bufferRepo.findOneLocal({ id: buffer }) ?? buffer;
          return buffer;
        })
        .filter(Boolean);
    }

    for (const trait of thread.traits ?? []) {
      threadTraits[trait]?.(thread);
    }
  };
}
