// TODO temporary — m76 probe: the tangled lighthouse shape, in-process, in-memory sqlite
import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Aperture, Connection, Datamap, Url, Vector, shape, shard, steer } from "@vivalence/typology";
import { AuthenticatorEmbedSchema, IdentitySchema, DaemonSchema, TerminalSchema } from "./subsystems/typology/entities/lighthouse/index.ts";
import { attachment as exported } from "./commons/lighthouses/multiplayer/attachment/index.js";
import { stagger } from "./systems/runtime/gestalten/belt/stagger.js";
import * as serviceTraits from "./systems/runtime/lifecycle/service/traits/index.js";
import { RULES, probe as integrity } from "./subsystems/paladin/prototypes/ledger/integrity.js";
import { manifest as lighthouseManifest } from "./commons/lighthouses/multiplayer/multiplayer.viva.js";
import provider from "./commons/lighthouses/multiplayer/provider/index.js";

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
const service = { attachment: new Aperture(), manifest: { type: "lighthouse", slug: "multiplayer" }, datamap, entities: datamap.entities };
service.twitch = new Vector();
service.twitch.branch("/after").use(shard.datamap.detached(datamap));
datamap.registerSubscriber(shape.subscriber(service.twitch));
service.attachment
  .use(shard.datamap.inject(datamap))
  .use(shard.context.bind("service", service))
  .use(shard.context.bind("mask", mask));
service.attachment.graft(exported);
const die = { service };
check("the exported aperture grafts (trie carries /auth · /entities · /metadata · /datamap)", ["auth", "entities", "metadata"].every((n) => [...service.attachment.trie.keys()].includes(n)), [...service.attachment.trie.keys()].join(","));
{
  const subject = { manifest: { traits: ["SERVICE", "PROVIDER", "DATAMAP", "ATTACHED"] }, attachment: new Aperture(), controller: { status: "RUNNING" } };
  const fake = { ...serviceTraits, DATAMAP: async (svc) => { svc.datamap = datamap; svc.attachment.use(shard.datamap.inject(datamap)); return { terminate: () => {} }; } };
  const finalizers = await stagger(subject, { attachment: exported, statics: {} }, fake);
  check("F14: stagger over [SERVICE, PROVIDER, DATAMAP, ATTACHED] → 1 terminator (the orm), 0 finalizers, doors grafted", subject.terminators?.length === 1 && finalizers.length === 0 && [...subject.attachment.trie.keys()].includes("auth"), `terminators ${subject.terminators?.length} finalizers ${finalizers.length} trie ${[...subject.attachment.trie.keys()].join(",")}`);
}

const handler = shape.http(die.service.attachment);
const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
const as = (token) => new Connection(new Url("http://test"), shard.transmitter.inline(handler)).use(async (ctx, next) => {
  ctx.request.headers.set("authorization", `Bearer ${token}`);
  await next();
});

const meta = await conn.call("/metadata/datamap");
check("no token store: the service carries no jwt state", service.jwt === undefined && service.release === undefined);
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

const daemon = await datamap.entities.daemon.create({ slug: "brazilian", remote: "http://localhost:2501", reported: "RUNNING" });
await orm.em.flush();
const identity = await datamap.entities.identity.findOneOrFail({ id: signup.identity.id }, { populate: ["daemons"] });
identity.daemons.add(daemon);
await orm.em.flush();
const visible = await finn.call("/entities/daemon/find", { where: {} });
check("/entities/daemon/find: through the pivot (finn sees 1)", visible?.length === 1 && visible[0].slug === "brazilian", JSON.stringify(visible?.map((d) => d.slug)));
const hidden = await beef.call("/entities/daemon/find", { where: {} });
check("/entities/daemon/find: beef has no pivot row → 0", Array.isArray(hidden) && hidden.length === 0, String(hidden?.length));
const write = (await finn.fetch("/entities/daemon/create", { data: { slug: "x", remote: "http://x" } })).body;
check("/entities/daemon: create door closed (only read verbs)", write == null || write?.code === "NOT_FOUND" || write?.status === "ERROR" || write?.error, JSON.stringify(write));

const seated = await finn.call("/entities/terminal/updateOne", { where: { id: t1.id }, data: { daemon: daemon.id, thread: "0192-thread" } });
check("/entities/terminal/updateOne: seat daemon + thread", (seated?.daemon?.id ?? seated?.daemon) === daemon.id && seated?.thread === "0192-thread", JSON.stringify({ daemon: seated?.daemon, thread: seated?.thread }));
await datamap.entities.daemon.removeOne({ id: daemon.id });
const unseated = await finn.call("/entities/terminal/findOne", { where: { id: t1.id } });
check("daemon removed → terminal.daemon set null (thread string stays)", (unseated?.daemon ?? null) === null && unseated?.thread === "0192-thread", JSON.stringify({ daemon: unseated?.daemon, thread: unseated?.thread }));

const pivot = await orm.em.getConnection().execute(`select name from sqlite_master where type='table' order by name`);
check("pivot table named Identity_daemons", pivot.some((r) => r.name === "Identity_daemons"), pivot.map((r) => r.name).join(","));

// F18 · F19 — announce (open, status rides it) · enroll writes the pivot · no prune
const announced = await conn.call("/daemons/announce", { slug: "rhythm", remote: "http://localhost:2501", reported: "MOUNTING" });
check("/daemons/announce: no token → daemon row with reported status", announced?.slug === "rhythm" && announced?.reported === "MOUNTING" && typeof announced?.id === "string", JSON.stringify(announced));
const reannounced = await conn.call("/daemons/announce", { slug: "rhythm", remote: "http://localhost:2502", reported: "RUNNING" });
check("/daemons/announce: same slug → same row, remote and reported moved (ensure)", reannounced?.id === announced?.id && reannounced?.remote === "http://localhost:2502" && reannounced?.reported === "RUNNING", JSON.stringify(reannounced));
const stopped = await conn.call("/daemons/announce", { slug: "rhythm", remote: "http://localhost:2502", reported: "STOPPED" });
check("/daemons/announce: STOPPED lands; updatedAt is the age", stopped?.reported === "STOPPED" && typeof stopped?.updatedAt === "string", JSON.stringify({ reported: stopped?.reported, updatedAt: stopped?.updatedAt }));
const users = { rows: [], upsert: async (row) => { users.rows.push(row); }, findOne: async ({ id }) => users.rows.find((r) => r.id === id) ?? null };
const status = { code: "RUNNING", $transient: { subscribe: (fn) => { fn(0); return () => {}; } } };
const lighthouse = provider({ statics: {} }, { users, connection: conn, status, daemon: "rhythm", remote: "http://localhost:2502" });
await lighthouse.announced;
const handle = await lighthouse.authenticate(signup.authority.access);
const enrolled = await handle.enroll();
const granted = await finn.call("/entities/daemon/find", { where: {} });
check("provider → Lighthouse: construction announces (RUNNING on the row); enroll → /auth/enroll writes the pivot (finn sees rhythm) and mints the user", enrolled?.id === signup.identity.id && granted?.some((d) => d.slug === "rhythm" && d.reported === "RUNNING"), JSON.stringify({ user: enrolled, daemons: granted?.map((d) => [d.slug, d.reported]) }));
await handle.enroll();
const again = await finn.call("/entities/daemon/find", { where: {} });
check("enroll twice → one pivot row", again?.filter((d) => d.slug === "rhythm").length === 1, JSON.stringify(again?.map((d) => d.slug)));
const stale = (await conn.fetch("/auth/enroll", { access: "not-a-token", daemon: "rhythm" })).body;
check("/auth/enroll: stale token refused", stale?.status === "ERROR" && stale?.error?.code === "INVALID_TOKEN", JSON.stringify(stale));
const unknown = (await conn.fetch("/auth/enroll", { access: signup.authority.access, daemon: "ghost" })).body;
check("/auth/enroll: unannounced daemon refused", unknown?.status === "ERROR" && unknown?.error?.code === "DAEMON_NOT_FOUND", JSON.stringify(unknown));
const ghost = provider({ statics: {} }, { users, connection: conn, status, daemon: "ghost", remote: "http://ghost" });
await ghost.announced;
const announcedByConstruction = await datamap.entities.daemon.findOne({ slug: "ghost" });
check("a Lighthouse announces its daemon at construction (ghost row exists, status RUNNING)", announcedByConstruction?.reported === "RUNNING" && announcedByConstruction?.remote === "http://ghost", JSON.stringify(announcedByConstruction && { slug: announcedByConstruction.slug, reported: announcedByConstruction.reported }));
const pruned = (await conn.fetch("/daemons/prune", { origin: "http://localhost:2502", keep: [] })).body;
check("/daemons/prune does not exist (no pruning — unsafe)", pruned == null || pruned?.status === "ERROR" || pruned?.error, JSON.stringify(pruned));

// F17 — paladin integrity: PROVIDER names the provider export, ATTACHED the attachment, SERVICE wants a control vector unless ATTACHED
const faults = (module) => { const held = []; integrity(RULES)(module, { fault: (error) => held.push(error.message) }); return held; };
const sound = { manifest: lighthouseManifest, attachment: exported, provider: () => {} };
check("integrity: the lighthouse module passes (SERVICE · PROVIDER · DATAMAP · ATTACHED, attachment + provider exports)", faults(sound).length === 0, faults(sound).join(" | "));
const noProvider = { manifest: lighthouseManifest, attachment: exported };
check("integrity: PROVIDER without a provider export faults", faults(noProvider).some((f) => f.startsWith("PROVIDER: no provider export")), faults(noProvider).join(" | "));
const bare = { manifest: { slug: "bare", type: "service", traits: ["SERVICE"] } };
check("integrity: SERVICE that is not ATTACHED wants a control export", faults(bare).some((f) => f.startsWith("SERVICE: no control export")), faults(bare).join(" | "));
const controlled = { manifest: { slug: "ctl", type: "service", traits: ["SERVICE"] }, control: new Vector() };
check("integrity: SERVICE with a control vector and no ATTACHED passes", faults(controlled).length === 0, faults(controlled).join(" | "));
const orphan = { manifest: { slug: "orphan", type: "service", traits: ["PROVIDER"] }, provider: () => {} };
check("integrity: PROVIDER without SERVICE faults", faults(orphan).some((f) => f.startsWith("PROVIDER: not a SERVICE")), faults(orphan).join(" | "));
const oldWord = { manifest: { slug: "old", type: "service", traits: ["SERVICE", "ATTACHED"] }, aperture: new Vector() };
check("integrity: ATTACHED names attachment, an aperture export no longer satisfies it", faults(oldWord).some((f) => f.startsWith("ATTACHED: no attachment export")), faults(oldWord).join(" | "));

await orm.close();
const pass = results.filter((r) => r.ok).length;
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
console.log(`\n${pass} passed | ${results.length - pass} failed`);
