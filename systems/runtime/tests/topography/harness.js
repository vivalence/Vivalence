import { MikroORM } from "@mikro-orm/core";
import paladin from "@vivalence/paladin";

import { Aperture, Connection, contexts, Datamap, middleware, RemoteEntityManager, RemoteRepository, shape, shard, specimen, Twitch, Url } from "@vivalence/typology";
import { gestalten, lifecycle, sets } from "@vivalence/runtime";
import { instance } from "../scenarios/fixtures.js";
import { accio } from "../scenarios/registry.js";

const { gather, mint, strike } = gestalten.belt;
const DAEMON = "brazilian";

class LiteralKind {}
class SymbolKind {}

// the DB rides the mounted instance, never a repo-relative walk — the dev instance moved out of
// testament/ and a hardcoded path here does not fail, it makes `missing()` skip the whole suite.
export const DB = paladin.scope.mountpoint
  ? paladin.scope.mountpoint.branch("daemon_brazilian/test-language.viva.db").absolute
  : null;

export const SNAPSHOTS = new URL("../snapshots", import.meta.url).pathname;

export const DRY = Deno.env.get("SNAPSHOT_HOT") !== "1";

export const missing = () => {
  if (!DB) return true;
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
  const { config } = await accio("@commons/datamap/libsql");
  const domain = await accio("@education/domain/language-learning");
  const descriptors = instance();
  const orm = await MikroORM.init({
    ...config({}, { dbName: DB, entities: descriptors.map((descriptor) => descriptor.schema) }),
    allowGlobalContext: true,
  });
  const datamap = new Datamap(orm);
  const traits = Object.fromEntries(Object.keys(sets.traits).map((kind) => [kind, gather(domain, [], kind)]));
  const entities = { ...datamap.entities, ...strike(mint({ slug: DAEMON, kinds: sets.traits, traits }), orm.em, sets.traits) };

  const daemon = { slug: DAEMON, aperture: new Aperture(), entities, twitch: new Twitch(), datamap };
  daemon.twitch.use(shard.context.spread(contexts.host, daemon)).use(shard.datamap.owned());
  daemon.twitch.branch("/after").use(shard.datamap.detached(datamap));
  datamap.registerSubscriber(daemon.twitch);
  await middleware.compose([lifecycle.daemon.integration.datamap, lifecycle.daemon.integration.entities])({ daemon });

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
