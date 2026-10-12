import {
  object,
  Connection,
  Cortex,
  Url,
  Path,
  RemoteRepository,
  Span,
  shape,
  shard, cortex } from "@vivalence/typology";
import { logger } from "$telemetry";
import { Daemon } from "./prototype.js";
import { Cargo } from "../../prototypes/cargo.js";
import { Dataspace } from "../../prototypes/dataspace.js";
import { ModeDossier } from "../mode/index.js";
import { IntentDossier } from "../intent.js";
import { ThreadDossier } from "../thread/index.js";
import { BufferDossier } from "../buffer.js";
import { TurnDossier } from "../turn.js";
import { ActivityDossier } from "../activity.js";
import { LiteralDossier } from "../literal.js";
import { SymbolDossier } from "../symbol.js";

const entities = [
  ModeDossier,
  IntentDossier,
  ThreadDossier,
  BufferDossier,
  TurnDossier,
  ActivityDossier,
  LiteralDossier,
  SymbolDossier,
];

function seedDaemon(daemon) {
  return (vector) => vector.use(shard.context.bind("daemon", daemon));
}

export const DaemonDossier = {
  name: "daemon",
  kind: () => Daemon,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/metadata/daemons"));
    repo.find = async () => {
      const roster = await dataspace.connection.call("/metadata/daemons");
      const origin = new Url(dataspace.connection.url);
      return repo.epoch(() =>
        Promise.all(roster.map((row) => repo.cast({ id: row.slug, slug: row.slug, reference: row.reference, remote: origin.branch(row.reference).absolute }))),
      );
    };
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      // console.log("daemon/dossier ctx.entity", ctx.entity);

      const daemon = ctx.entity;
      const url = new Url(daemon.remote);

      const multiplex = shard.transmitter.multiplex({ authority: ctx.lighthouse.$authority });
      daemon.connection = new Connection(url, shard.transmitter.retry(multiplex, { maxRetries: 2 }))
        .use(shard.track.span((call) => call.request.url.pathname, ctx.channel))
        .use(shard.track.request())
        .use(shard.track.fault())
        .use(shard.connection.timeout(8000));

      daemon.lighthouse = ctx.lighthouse;
      daemon.release = multiplex.close;
      daemon.entities = new Dataspace({
        connection: daemon.connection,
        runtime: ctx.lighthouse.runtime,
        entities,
        seed: seedDaemon(daemon),
      });
      daemon.cargo = new Cargo(daemon.connection);
      daemon.mounting = (async () => {
        for (let attempt = 1; ; attempt++) {
          const outcome = await mount(daemon, { multiplex, url, attempt });
          if (outcome !== "unreachable") return outcome;
          const delay = Math.min(RETRY.base * 2 ** (attempt - 1), RETRY.ceiling);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      })();
    },
  ],
};

const RETRY = { base: 5000, ceiling: 60000 };

async function mount(daemon, { multiplex, url, attempt }) {
  const mounting = logger.entry(`daemon/${daemon.slug ?? daemon.remote}`).open();
  const probing = Date.now();
  daemon.status.set("mounting");
  mounting.note({ message: "probing", url: url.absolute, attempt });
  const offState = multiplex
    .$state(url.origin)
    .listen((state) => mounting.note({ message: `multiplex → ${state}` }));

  try {
    const [status, manifest, stripped, aperture, statics] = await Promise.all([
      daemon.connection.call("/status"),
      daemon.connection.call("/metadata/manifest"),
      daemon.connection.call("/metadata/cortex"),
      daemon.connection.call("/metadata/aperture"),
      daemon.connection.call("/metadata/statics"),
      daemon.cargo.refetch(),
      daemon.entities.init(),
    ]);
    daemon.status.set(status);
    daemon.manifest = manifest;
    daemon.statics = statics;
    daemon.reference = new Path(`/daemon/${manifest.slug}`);
    daemon.link = new Path(`/${daemon.lighthouse.manifest.slug}/${manifest.slug}`).rebase("/viva");
    daemon.call = shape.connection.wire(daemon.connection, aperture);
    // await daemon.entities.populate(["mode", "intent", "thread"]);

    // await daemon.entities.thread.find({}, { populate: ["mode","buffers"] });
    // daemon.entities.buffer.find({}, { populate: ["literals", "symbols"] });

    const modes = await daemon.entities.mode.find({}, { populate: [] });
    const [threads, intents] = await Promise.all([
      daemon.entities.thread.find({}, { populate: [] }),
      daemon.entities.intent.find({}, { populate: [] }),
    ]);
    daemon.entities.intent.subscribe();
    daemon.entities.thread.subscribe();
    daemon.entities.buffer.subscribe();
    daemon.entities.turn.subscribe();
    const activity = new Span(`daemon/${manifest.slug}/activity`).to(logger.channel);
    daemon.entities.activity.subscribe({}, (row, event) => {
      const id = row?.id ?? event.entity?.id ?? event.entity;
      activity.mark(event.op, { id, status: row?.status, step: row?.steps.at(-1) });
      if (event.op === "create") (async () => {
        for await (const record of await row.stdout()) activity.mark("stdout", { id, ...record });
      })().catch(() => {});
    });

    daemon.cortex = new Cortex().register(
      cortex.wire(daemon.connection.branch("/cortex"), stripped),
    );

    for (const mode of modes) {
      object.place(daemon.modes, `${mode.type}.${mode.slug}`, mode);
    }

    daemon.status.set("healthy");
    daemon.connection
      .branch("/status")
      .subscribe("/subscribe", (reflection) =>
        daemon.status.set(reflection?.code === "RUNNING" ? "healthy" : "unavailable"),
      );
    mounting.note({
      message: `${manifest.slug} mounted`,
      modes: modes.length,
      threads: threads.length,
      intents: intents.length,
      ms: Date.now() - probing,
    });
    mounting.close();
    return "mounted";
  } catch (error) {
    if (!["CLIENT", "NETWORK", "TIMEOUT"].includes(error?.type)) {
      daemon.status.set({ code: "error", error });
      mounting.fault(error);
      mounting.close();
      return "error";
    }
    daemon.status.set({ code: "unavailable", error });
    mounting.note({
      message: `${daemon.slug ?? daemon.remote} unreachable (${error.type}) — will retry`,
      attempt,
      ms: Date.now() - probing,
    });
    mounting.fault(error);
    mounting.close();
    return "unreachable";
  } finally {
    offState();
  }
}
