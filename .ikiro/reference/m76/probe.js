// TODO temporary — m76 probe: the tangled lighthouse shape, in-process, in-memory sqlite
import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Aperture, Connection, Datamap, Url, Vector, shape, shard, steer } from "@vivalence/typology";
import { AuthenticatorEmbedSchema, IdentitySchema, DaemonSchema, TerminalSchema } from "./subsystems/typology/entities/lighthouse/index.ts";
import { attachment as exported } from "./commons/lighthouses/multiplayer/attachment/index.js";
import { stagger } from "./systems/runtime/gestalten/belt/stagger.js";
import * as serviceTraits from "./systems/runtime/lifecycle/service/traits/index.js";

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

const orm = await MikroORM.init(
  defineConfig({
    dbName: ":memory:",
    entities: [IdentitySchema, DaemonSchema, TerminalSchema, AuthenticatorEmbedSchema],
    allowGlobalContext: true,
    debug: false,
  }),
);
await orm.schema.createSchema();
const datamap = new Datamap(orm);
check("schema: tables", true, orm.getMetadata().getAll() && Object.keys(orm.getMetadata().getAll()).join(","));

const here = new URL(".", import.meta.url).pathname;
const mask = {
  secrets: { jwt: "probe-secret-probe-secret-probe-secret" },
  mountpoint: { branch: (p) => ({ absolute: here + p.replace(/^\//, "") }) },
};
const service = { attachment: new Aperture(), manifest: { type: "lighthouse", slug: "multiplayer" }, datamap, entities: datamap.entities, release: [] };
service.attachment
  .use(shard.datamap.inject(datamap))
  .use(shard.context.bind("service", service))
  .use(shard.context.bind("mask", mask));
service.attachment.graft(exported);
const die = { service };
check("the exported aperture grafts (trie carries /auth · /entities · /metadata · /datamap)", ["auth", "entities", "metadata"].every((n) => [...service.attachment.trie.keys()].includes(n)), [...service.attachment.trie.keys()].join(","));
check("tokens not minted before the first request", service.jwt === undefined);
{
  const subject = { manifest: { traits: ["SERVICE", "DATAMAP", "ATTACHED"] }, attachment: new Aperture(), controller: { status: "RUNNING" } };
  const fake = { ...serviceTraits, DATAMAP: async (svc) => { svc.datamap = datamap; svc.attachment.use(shard.datamap.inject(datamap)); return { terminate: () => {} }; } };
  const finalizers = await stagger(subject, { attachment: exported, statics: {} }, fake);
  check("F14: stagger over [SERVICE, DATAMAP, ATTACHED] → 2 terminators, 0 finalizers, doors grafted", subject.terminators?.length === 2 && finalizers.length === 0 && [...subject.attachment.trie.keys()].includes("auth"), `terminators ${subject.terminators?.length} finalizers ${finalizers.length} trie ${[...subject.attachment.trie.keys()].join(",")}`);
}

const handler = shape.http(die.service.attachment);
const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
const as = (token) => new Connection(new Url("http://test"), shard.transmitter.inline(handler)).use(async (ctx, next) => {
  ctx.request.headers.set("authorization", `Bearer ${token}`);
  await next();
});

const meta = await conn.call("/metadata/datamap");
check("tokens minted once on the first request · release holds the sweep teardown", service.jwt && service.release.length === 1, String(service.release.length));
check("/metadata/datamap", meta?.terminal && meta?.identity && meta?.daemon, Object.keys(meta ?? {}).join(","));
check("/metadata/datamap: terminal.properties", meta?.terminal?.properties?.identity?.kind === "m:1" && meta?.terminal?.properties?.daemon?.kind === "m:1", JSON.stringify(meta?.terminal?.properties));
check("/metadata/manifest", (await conn.call("/metadata/manifest"))?.slug === "multiplayer");
check("/metadata/statics", typeof (await conn.call("/metadata/statics")) === "object");
const stripped = await conn.call("/metadata/attachment");
check("/metadata/attachment strips the doors", JSON.stringify(stripped).includes("auth"), JSON.stringify(stripped).slice(0, 160));
check("root /datamap absent (metadata scoped like daemon and mode)", (await conn.fetch("/datamap")).status === 404 || (await conn.fetch("/datamap")).body == null);

const signup = await conn.call("/auth/signup", { username: "finn", password: "hunter22" });
check("/auth/signup", signup?.status === "SUCCESS" && signup.identity?.id && signup.authority?.access, JSON.stringify(signup?.identity));
check("/auth/signup: identity card carries traits", Array.isArray(signup?.identity?.traits), JSON.stringify(signup?.identity?.traits));
const other = await conn.call("/auth/signup", { username: "beef", password: "biggusdickus" });
const login = await conn.call("/auth/login", { username: "finn", password: "hunter22" });
check("/auth/login", login?.status === "SUCCESS" && login.authority?.access);
const bad = (await conn.fetch("/auth/login", { username: "finn", password: "nope" })).body;
check("/auth/login: rejects", bad?.status === "ERROR" && bad.error?.code === "INVALID_CREDENTIALS", JSON.stringify(bad));
const verify = await conn.call("/auth/verify", { access: login.authority.access });
check("/auth/verify: card", verify?.identity?.id === signup.identity.id && "trait" in verify.identity, JSON.stringify(verify));
const refreshed = await conn.call("/auth/refresh", { refresh: login.authority.refresh });
check("/auth/refresh", refreshed?.status === "SUCCESS" && refreshed.access);

const anon = (await conn.fetch("/entities/terminal/find", { where: {} })).body;
check("/entities/terminal: unauthenticated → 401 body", anon?.status === "ERROR" && anon.error?.code === "MISSING_TOKEN", JSON.stringify(anon));

const finn = as(login.authority.access);
const t1 = await finn.call("/entities/terminal/create", { data: {} });
check("/entities/terminal/create: identity seated by scope", t1?.identity === signup.identity.id || t1?.identity?.id === signup.identity.id, JSON.stringify({ id: t1?.id, identity: t1?.identity?.id ?? t1?.identity, index: t1?.index }));
check("/entities/terminal/create: index 0", t1?.index === 0, String(t1?.index));
check("LEAK: populated identity on the row hides authentication", t1?.identity?.authentication === undefined, JSON.stringify(Object.keys(t1?.identity ?? {})));
check("/auth/login still reads credentials (hidden is serialization only)", login?.status === "SUCCESS");
const t2 = await finn.call("/entities/terminal/create", { data: { traits: ["LABELED"], trait: { LABELED: { name: "grammar" } } } });
check("/entities/terminal/create: second → index 1, LABELED kept", t2?.index === 1 && t2?.trait?.LABELED?.name === "grammar", JSON.stringify({ index: t2?.index, trait: t2?.trait }));

const beef = as(other.authority.access);
const t3 = await beef.call("/entities/terminal/create", { data: {} });
check("/entities/terminal/create: other identity → own index 0", t3?.index === 0, String(t3?.index));
const mine = await finn.call("/entities/terminal/find", { where: {} });
check("/entities/terminal/find: scoped to finn (2 rows)", Array.isArray(mine) && mine.length === 2, String(mine?.length));
const theirs = await beef.call("/entities/terminal/find", { where: {} });
check("/entities/terminal/find: scoped to beef (1 row)", Array.isArray(theirs) && theirs.length === 1, String(theirs?.length));

const override = await finn.call("/entities/terminal/find", { where: { identity: other.identity.id } });
check("HOLE closed: client where.identity cannot widen the scope", Array.isArray(override) && override.length === 2 && override.every((row) => (row.identity?.id ?? row.identity) === signup.identity.id), `returned ${override?.length} rows, owners ${JSON.stringify([...new Set(override?.map((r) => r.identity?.id ?? r.identity))])} (finn only = scope wins)`);

const daemon = await datamap.entities.daemon.create({ slug: "brazilian", url: "http://localhost:2501" });
await orm.em.flush();
const identity = await datamap.entities.identity.findOneOrFail({ id: signup.identity.id }, { populate: ["daemons"] });
identity.daemons.add(daemon);
await orm.em.flush();
const visible = await finn.call("/entities/daemon/find", { where: {} });
check("/entities/daemon/find: through the pivot (finn sees 1)", visible?.length === 1 && visible[0].slug === "brazilian", JSON.stringify(visible?.map((d) => d.slug)));
const hidden = await beef.call("/entities/daemon/find", { where: {} });
check("/entities/daemon/find: beef has no pivot row → 0", Array.isArray(hidden) && hidden.length === 0, String(hidden?.length));
const write = (await finn.fetch("/entities/daemon/create", { data: { slug: "x", url: "http://x" } })).body;
check("/entities/daemon: create door closed (only read verbs)", write == null || write?.code === "NOT_FOUND" || write?.status === "ERROR" || write?.error, JSON.stringify(write));

const seated = await finn.call("/entities/terminal/updateOne", { where: { id: t1.id }, data: { daemon: daemon.id, thread: "0192-thread" } });
check("/entities/terminal/updateOne: seat daemon + thread", (seated?.daemon?.id ?? seated?.daemon) === daemon.id && seated?.thread === "0192-thread", JSON.stringify({ daemon: seated?.daemon, thread: seated?.thread }));
await datamap.entities.daemon.removeOne({ id: daemon.id });
const unseated = await finn.call("/entities/terminal/findOne", { where: { id: t1.id } });
check("daemon removed → terminal.daemon set null (thread string stays)", (unseated?.daemon ?? null) === null && unseated?.thread === "0192-thread", JSON.stringify({ daemon: unseated?.daemon, thread: unseated?.thread }));

const pivot = await orm.em.getConnection().execute(`select name from sqlite_master where type='table' order by name`);
check("pivot table named Identity_daemons", pivot.some((r) => r.name === "Identity_daemons"), pivot.map((r) => r.name).join(","));

for (const release of service.release) release();
await orm.close();
const pass = results.filter((r) => r.ok).length;
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
console.log(`\n${pass} passed | ${results.length - pass} failed`);
