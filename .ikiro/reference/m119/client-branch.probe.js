import { MikroORM } from "@mikro-orm/core";
import { Aperture, Connection, Datamap, RemoteEntityManager, RemoteRepository, shape, shard, Url } from "@vivalence/typology";
import { sets, DaemonEntity, LiteralEntity, ModeEntity, ThreadEntity, TurnEntity, UserEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const ROW = (name) => ({ cond: (args) => (args?.[name] ? { [name]: args[name] } : {}), default: true, args: false });
const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
const schema = (type) => assembled.entities.find((d) => d.type === type).schema.meta;
for (const type of ["literal", "symbol", "note", "mode"]) schema(type).filters.daemon = ROW("daemon");
for (const type of ["literal", "symbol", "view", "intent", "file", "note", "thread", "turn", "buffer"]) schema(type).filters.mode = ROW("mode");

const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
await orm.schema.create();
const datamap = new Datamap(orm);
const em = datamap.entities.em;

let seeded;
await datamap.shard.scope(async () => {
  em.setFilterParams("user", { user: null });
  const beef = em.create(UserEntity, { slug: "beef" });
  const edu = em.create(DaemonEntity, { slug: "edu" });
  await em.flush();
  const italian = em.create(ModeEntity, { slug: "italian", type: "language", daemon: edu });
  const chess = em.create(ModeEntity, { slug: "chess", type: "game", daemon: edu });
  await em.flush();
  for (const [mode, slug] of [[italian, "ciao"], [italian, "grazie"], [chess, "e4"]]) {
    em.create(LiteralEntity, { slug, daemon: edu, mode, literal: slug, mime: "text/plain", traits: [], trait: {} });
  }
  const a = em.create(ThreadEntity, { user: beef, mode: italian });
  const b = em.create(ThreadEntity, { user: beef, mode: chess });
  await em.flush();
  em.create(TurnEntity, { role: "user", parts: [{ text: "ciao" }], thread: a, mode: italian });
  em.create(TurnEntity, { role: "user", parts: [{ text: "e4" }], thread: b, mode: chess });
  await em.flush();
  seeded = { user: beef.id, italian: italian.id, chess: chess.id };
});

const daemon = new Aperture()
  .use(shard.datamap.inject(datamap))
  .use(datamap.shard.bind("daemon", () => ({ daemon: "edu" })))
  .use(async (ctx, next) => { ctx.user = { id: seeded.user }; await next(); })
  .use(datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));
for (const kind of ["literal", "mode"]) daemon.branch(`/entities/${kind}`).graft(shard.datamap.repository(datamap.entities[kind]));

const mode = (slug, id) => {
  const aperture = new Aperture()
    .use(async (ctx, next) => { ctx.mode = { id }; await next(); })
    .use(datamap.shard.bind("mode", (ctx) => ({ mode: ctx.mode.id })));
  for (const kind of ["literal", "symbol", "view", "intent", "file", "note", "thread", "turn", "buffer"]) {
    aperture.branch(`/entities/${kind}`).graft(shard.datamap.repository(datamap.entities[kind]));
  }
  daemon.branch(`/mode/${slug}`).graft(aperture);
};
mode("language/italian", seeded.italian);
mode("game/chess", seeded.chess);
const handler = shape.http(daemon);
const abort = new AbortController();
const server = Deno.serve({ port: 0, signal: abort.signal, onListen() {} }, handler);
const connection = new Connection(new Url(`http://localhost:${server.addr.port}`));

const remote = new RemoteEntityManager(connection, {});
const kinds = { literal: class Literal {}, turn: class Turn {} };
for (const name of ["literal", "turn"]) remote.register(name, new RemoteRepository(kinds[name]));
const branch = (where, kinds) => Object.fromEntries(kinds.map((name) => [name, new RemoteRepository(remote.repositoryMap[name].kind).connect(where.branch(`/entities/${name}`)).manage(remote, name)]));

const daemonEntities = branch(connection, ["literal"]);
const italian = { connection: connection.branch("/mode/language/italian") };
italian.entities = branch(italian.connection, ["literal", "turn"]);
const chess = { connection: connection.branch("/mode/game/chess") };
chess.entities = branch(chess.connection, ["literal"]);

const slugs = (rows) => rows.map((row) => row.slug);
console.log("daemon.entities.literal.find({})   ", JSON.stringify(slugs(await daemonEntities.literal.find({}))));
console.log("italian.entities.literal.find({})  ", JSON.stringify(slugs(await italian.entities.literal.find({}))));
console.log("chess.entities.literal.find({})    ", JSON.stringify(slugs(await chess.entities.literal.find({}))));
console.log("italian.entities.turn.find({})     ", JSON.stringify((await italian.entities.turn.find({})).map((t) => t.parts[0].text)));
console.log("one store per kind: remote.stores.literal", JSON.stringify(slugs(remote.stores.literal.get())), "shared:", italian.entities.literal.$entities === chess.entities.literal.$entities && chess.entities.literal.$entities === remote.stores.literal);
console.log("italian.entities.literal.connection ", JSON.stringify(italian.entities.literal.connection.url.absolute));
abort.abort();
await orm.close();
