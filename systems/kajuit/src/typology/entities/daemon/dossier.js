import { object, Connection, Url, Path, RemoteRepository, shard } from "@vivalence/typology";
import { Daemon } from "./daemon.js";
import { Dataspace } from "../../prototypes/dataspace.js";
import { ModeDossier } from "../mode/index.js";
import { IntentDossier } from "../intent.js";
import { ThreadDossier } from "../thread/index.js";
import { BufferDossier } from "../buffer.js";
import { TurnDossier } from "../turn.js";
import { LiteralDossier } from "../literal.js";
import { SymbolDossier } from "../symbol.js";

const entities = [
  ModeDossier,
  IntentDossier,
  ThreadDossier,
  BufferDossier,
  TurnDossier,
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
    repo.connect(dataspace.connection.branch("/entities/daemon"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      // console.log("daemon/dossier ctx.entity", ctx.entity);

      const daemon = ctx.entity;
      const url = new Url(daemon.url);

      daemon.connection = new Connection(
        url,
        shard.transmitter.retry(shard.transmitter.fetcher, { maxRetries: 2 }),
      )
        .use(shard.track.span((call) => call.request.url.pathname, ctx.telemetry))
        .use(shard.track.request())
        .use(shard.track.fault())
        .use(shard.connection.timeout(8000))
        .use(shard.connection.authorize(ctx.lighthouse.$authority))
        .use(
          shard.connection.batch({
            hatch: url,
            filter: (call) => call.request.headers.get("accept") !== "text/event-stream",
          }),
        );

      daemon.lighthouse = ctx.lighthouse;
      daemon.call = daemon.connection.call.bind(daemon.connection);

      try {
        const [manifest, cargo] = await Promise.all([
          daemon.connection.call("/metadata/manifest"),
          daemon.connection.call("/metadata/cargo"),
        ]);
        daemon.manifest = manifest;
        daemon.mount = new Path(`/daemon/${manifest.slug}`);
        daemon.cargo = cargo;
        daemon.link = new Path(`/${ctx.lighthouse.manifest.slug}/${manifest.slug}`).rebase("/viva");

        daemon.entities = new Dataspace({
          entities,
          connection: daemon.connection,
          seed: seedDaemon(daemon),
        });
        await daemon.entities.init();
        // await daemon.entities.populate(["mode", "intent", "thread"]);

        // await daemon.entities.thread.find({}, { populate: ["mode","buffers"] });
        // daemon.entities.buffer.find({}, { populate: ["literals", "symbols"] });

        const [modes, threads, buffers, intents] = await Promise.all([
          daemon.entities.mode.find({}, { populate: [] }),
          daemon.entities.thread.find({}, { populate: [] }),
          daemon.entities.buffer.find({}, { populate: ["literals", "symbols"] }),
          daemon.entities.intent.find({}, { populate: [] }),
          //
        ]);

        daemon.entities.thread.subscribe();
        daemon.entities.buffer.subscribe();

        for (const mode of modes) {
          object.place(daemon.modes, `${mode.type}.${mode.slug}`, mode);
        }

        daemon.status.set("healthy");
        console.log(
          `[probe] daemon ${manifest.slug} mounted — modes:${modes.length} threads:${threads.length} buffers:${buffers.length} intents:${intents.length}`,
        );
      } catch (error) {
        if (!["CLIENT", "NETWORK", "TIMEOUT"].includes(error?.type)) {
          daemon.status.set({ code: "error", error });
          console.warn(`[probe] daemon ${daemon.slug ?? daemon.url} boot error (rethrown)`, error);
          throw error;
        }
        daemon.status.set({ code: "unavailable", error });
        console.warn(
          `[probe] daemon ${daemon.slug ?? daemon.url} unreachable (${error.type}) — booted inert, entities ${daemon.entities ? "HALF-BUILT" : "absent"}`,
          error,
        );
      }
    },
  ],
};
