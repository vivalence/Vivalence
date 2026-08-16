import { MikroORM } from "@mikro-orm/core";
import { config } from "../../../../registry/viva/datamap/libsql/libsql.viva.js";
import { Url, Connection, shard, shape, Aperture, Vector, specimen, RemoteRepository, RemoteEntityManager } from "@vivalence/typology";
import * as routes from "@vivalence/runtime/daemon/aperture";
import { variant } from "../scenarios/fixtures.js";

class LiteralKind {}
class SymbolKind {}

export const DB = new URL(
  "../../../../testament/variant/mountpoint/daemon_brazilian/test-language.viva.db",
  import.meta.url,
).pathname;

export const SNAPSHOTS = new URL("../snapshots", import.meta.url).pathname;

export const DRY = Deno.env.get("SNAPSHOT_HOT") !== "1";

export const missing = () => {
  try {
    Deno.statSync(DB);
    return false;
  } catch {
    return true;
  }
};

export const LITERAL_SLUGS = [
  "aspectos.noun",
  "americana.adjective",
  "como.adverb",
  "a.pronoun",
  "do.contraction",
  "ser.verb.infinitive",
  "oi-tudo-bem",
  "bom-dia-como-voce-esta",
  "falar.present.indicative",
  "ser.verb.indicative.imperfect.third.singular",
];

export const SYMBOL_SLUGS = [
  "word",
  "sentence",
  "conjugation",
  "word.tense.future",
  "sentence.force.imperative",
  "word.case.vocative",
  "domain.family",
  "word.lemma.família",
];

export async function topography() {
  const descriptors = variant();
  const orm = await MikroORM.init({
    ...config({
      dbName: DB,
      entities: descriptors.map((descriptor) => descriptor.schema),
      subscribers: descriptors.map((descriptor) => descriptor.subscriber),
    }),
    allowGlobalContext: true,
  });

  const entities = { em: orm.em, twitch: new Vector() };
  for (const { type, entity } of descriptors) {
    if (entity && type) entities[type] = orm.em.getRepository(entity);
  }

  const daemon = { aperture: new Aperture(), entities, twitch: entities.twitch };
  const die = { good: daemon, datamap: { introspect: () => orm.getMetadata() } };
  await routes.datamap(die);

  const handler = shape.http(daemon.aperture);
  const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));

  const em = new RemoteEntityManager(conn, await conn.call("/datamap"));
  const literal = new RemoteRepository(LiteralKind).connect(conn.branch("/entities/literal"));
  const symbol = new RemoteRepository(SymbolKind).connect(conn.branch("/entities/symbol"));
  em.register("literal", literal);
  em.register("symbol", symbol);
  const client = { em, literal, symbol };

  return { orm, entities, conn, client, close: () => orm.close() };
}

const VOLATILE = new Set(["createdAt", "updatedAt"]);

export function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const projected = {};
    for (const [key, inner] of Object.entries(value)) {
      if (VOLATILE.has(key)) continue;
      projected[key] = stable(inner);
    }
    return projected;
  }
  return value;
}

export function order(rows, slugs) {
  const rank = new Map(slugs.map((slug, index) => [slug, index]));
  return [...rows].sort((a, b) => (rank.get(a.slug) ?? Infinity) - (rank.get(b.slug) ?? Infinity));
}

export function persist(pojo, locate) {
  return specimen.snapshot(pojo, { base: SNAPSHOTS, dry: DRY, parse: (value) => value, locate });
}
