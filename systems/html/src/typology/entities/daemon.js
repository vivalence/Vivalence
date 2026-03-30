import { Connection, Path, RemoteRepository, shard } from "@vivalence/typology";
import { Mode } from "./mode.js";
import { Intent } from "./intent.js";

export class Daemon {
  manifest = null;
  mount = null;
  connection = null;
  entities = {};
  cargo = {};

  constructor(connection) {
    this.connection = connection;
  }

  getAsset(asset) {
    if (!this.cargo || !asset) return null;
    if (asset.path) return this.cargo[asset.path] ?? null;
    if (asset.slug) {
      const entry = Object.entries(this.cargo).find(
        ([k]) => k.endsWith("/" + asset.slug) || k.startsWith(asset.slug),
      );
      return entry?.[1] ?? null;
    }
    return null;
  }

  toJSON() {
    return {
      slug: this.slug ?? this.manifest?.slug ?? null,
      mount: this.mount?.nature ?? null,
      manifest: this.manifest,
    };
  }
}

export const prototype = Daemon;

export async function lifecycle(daemon) {
  try {
    daemon.manifest = await daemon.connection.call("/manifest");
  } catch (error) {
    console.log("Error setting up daemon", { daemon });
    throw new Error("daemon doesnt manifest");
  }

  daemon.slug = daemon.manifest.slug;
  daemon.call = daemon.connection.call.bind(daemon.connection);
  daemon.mount = new Path(`/daemon/${daemon.slug}`);

  const lighthouseSlug = daemon.lighthouse?.manifest?.slug ?? "default";
  daemon.link = new Path(`/${lighthouseSlug}/${daemon.slug}`).rebase("/viva");

  daemon.entities = {
    mode: new RemoteRepository(Mode).connect(daemon.connection.branch("/entities/mode")),
    intent: new RemoteRepository(Intent).connect(daemon.connection.branch("/entities/intent")),
    thread: new RemoteRepository().connect(daemon.connection.branch("/userspace/entities/thread")),
    buffer: new RemoteRepository().connect(daemon.connection.branch("/userspace/entities/buffer")),
  };

  const schema = await daemon.connection.call("/datamap");
  shard.datamap.wire(daemon.entities, schema);

  daemon.cargo = await daemon.connection.call("/cargo"); // such a shortcut.

  const modes = await daemon.entities.mode.find();
  const modeById = new Map();
  for (const m of modes) {
    m.intents = new Set();
    m.daemon = daemon;
    m.mount = daemon.mount.branch(`/mode/${m.type}/${m.slug}`);
    m.connection = daemon.connection.branch(m.mount.nature);
    m.call = m.connection.call.bind(m.connection);
    if (m.implements("BUFFERED")) {
      m.buffered = await m.connection.call("/buffered");
      m.buffer = (desc = {}) => ({
        mode: m.id,
        data: { ...(m.buffered?.schema?.data ?? {}), ...(desc.data ?? {}) },
        literals: desc.literals ?? [],
        symbols: desc.symbols ?? [],
      });
    }
    // if (m.implements("BUFFERED")) {
    //   m.buffered = await m.connection.call("/buffered");
    //   m.buffer = (props = {}) => ({
    //     mode: m.id,
    //     props: { ...(m.buffered?.schema ?? {}), ...props },
    //   });
    // }
    m.link = daemon.link.branch(`/${m.type}/${m.slug}`);
    modeById.set(m.id, m);
  }

  const intents = await daemon.entities.intent.find();
  const intentById = new Map();
  for (const i of intents) {
    const modeId = i.mode?.id ?? i.mode;
    i.mode = modeById.get(modeId);

    if (!i.mode) throw new Error("Intents Mode not found");

    i.link = i.mode.link.branch(`/${i.slug}`);

    if (i.type === "APPLICATIVE" && i.trait?.FEEDING) {
      i.emit = i.mode.connection
        .clone()
        .use(async (ctx, next) => {
          await next();
          ctx.response.body = ctx.response.body.map((pojo) => {
            pojo.mode = modeById.get(pojo.mode) ?? pojo.mode;
            return pojo;
          });
        })
        .aim(i.trait.FEEDING.mount, {
          intent: i.id,
          ...(i.trait.FEEDING.mask ?? {}),
        });
    }

    i.mode.intents.add(i);
    intentById.set(i.id, i);
  }

  daemon.entities.mode.resolve = (mode) => {
    const enriched = modeById.get(mode.id);
    if (enriched && enriched !== mode) {
      Object.assign(mode, enriched);
    }
  };

  daemon.entities.intent.resolve = (intent) => {
    const modeId = typeof intent.mode === "object" ? intent.mode.id : intent.mode;
    intent.mode = modeById.get(modeId) ?? intent.mode;
  };

  daemon.entities.thread.resolve = (thread) => {
    thread.daemon = daemon;
    const modeId = typeof thread.mode === "object" ? thread.mode.id : thread.mode;
    thread.mode = modeById.get(modeId) ?? thread.mode;
    if (thread.intent) {
      const intentId = typeof thread.intent === "object" ? thread.intent.id : thread.intent;
      thread.intent = intentById.get(intentId) ?? thread.intent;
    }
  };
}
