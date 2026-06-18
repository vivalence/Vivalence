import { Connection, Url, Path, RemoteRepository, shard } from "@vivalence/typology";
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

      daemon.connection = new Connection(url)
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
        await daemon.entities.populate(["mode", "intent", "thread"]);

        await daemon.entities.buffer.find({}, { populate: ["literals", "symbols"] });
        daemon.entities.buffer.subscribe();

        daemon.status.set("healthy");
      } catch (error) {
        if (!["CLIENT", "NETWORK", "TIMEOUT"].includes(error?.type)) {
          daemon.status.set({ code: "error", error });
          throw error;
        }
        daemon.status.set({ code: "unavailable", error });
        console.warn(`[daemon] ${daemon.slug ?? daemon.url} unreachable — booted inert`, error);
      }
    },
  ],
};
