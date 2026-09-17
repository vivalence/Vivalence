import { shard, shape, Connection, sleep } from "@vivalence/typology";
import { Dataspace } from "../../../src/typology/prototypes/dataspace.js";
import { ActivityDossier } from "../../../src/typology/entities/activity.js";

export const stamp = () => new Date().toISOString().slice(11, 23);
export const idOf = (ref) => (ref && typeof ref === "object" ? ref.id : ref) ?? null;
export const short = (ref) => idOf(ref)?.slice(-6) ?? "—";

export async function consumer(url, token) {
  const transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: token }) } });
  const connection = new Connection(url, transport);
  const daemon = { connection };
  const entities = new Dataspace({
    connection,
    entities: [ActivityDossier],
    seed: (vector) => vector.use(shard.context.bind("daemon", daemon)),
  });
  await entities.init();
  daemon.call = shape.connection.wire(connection, await connection.call("/metadata/aperture"));
  daemon.entities = entities;
  return {
    transport,
    connection,
    daemon,
    repository: entities.activity,
    close: async () => {
      transport.close();
      await sleep.ms(20);
    },
  };
}

export const until = async (predicate, ms = 5000) => {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > ms) throw new Error("timeout");
    await sleep.ms(10);
  }
};
