import { specimen, shard, traits, v, Datamap, Path, Twitch, Vector } from "@vivalence/typology";
import { MikroORM, raw, UniqueConstraintViolationException } from "@mikro-orm/core";
import * as runtime from "@vivalence/runtime";
import { sets, kernel, DaemonEntity, LiteralEntity, LiteralRepository, NoteEntity, UserEntity, ThreadEntity, BufferEntity } from "@vivalence/runtime";
import { assemble } from "../gestalten/belt/assemble.js";
import { config, provider } from "../../../commons/datamaps/libsql/libsql.viva.js";
import { gather, mint, strike } from "../gestalten/belt/traits.js";

const KINDS = ["literal", "symbol", "note", "mode"];
const due = () => raw(`json_extract(l0.trait, '$.RETAINED.due')`);
const elo = () => raw(`json_extract(l0.trait, '$.RATED.elo')`);

const RETAINED = traits.define("RETAINED", {
  schematic: v.object({ due: v.string(), strength: v.number().optional() }),
  repository: {
    due(where = {}) {
      return this.find({ ...where, [due()]: { $lte: "2026-12-31" } }, { orderBy: { [due()]: "asc" } });
    },
  },
  entity: {
    assess(now = "2026-10-15") {
      return { overdue: this.trait.RETAINED.due < now, strength: this.trait.RETAINED.strength ?? 0 };
    },
  },
});

const RATED = traits.define("RATED", {
  schematic: v.object({ elo: v.number() }),
  repository: {
    strongest() {
      return this.find({}, { orderBy: { [elo()]: "desc" } });
    },
  },
  entity: {
    band() {
      return this.trait.RATED.elo >= 1850 ? "strong" : "club";
    },
  },
});

const DOMAINS = {
  italian: { traits: { literal: [RETAINED] } },
  spanish: { traits: { literal: [RETAINED] } },
  chess: { traits: { literal: [RATED] } },
  runtime: null,
};

const minting = (slug, domain, modes = []) =>
  mint({ slug, kinds: sets.traits, traits: Object.fromEntries(KINDS.map((kind) => [kind, gather(kernel, domain, modes, kind)])) });

const minted = Object.fromEntries(Object.entries(DOMAINS).map(([slug, domain]) => [slug, minting(slug === "runtime" ? null : slug, domain)]));

const instantiate = (em, slug) => strike(minted[slug], em, sets.traits);

async function world(dbName, { twitched = true } = {}) {
  const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
  const twitch = new Twitch();
  for (const each of assembled.twitch) twitch.graft(each);
  const queries = [];
  const orm = await MikroORM.init(
    config({}, {
      entities: assembled.entities.map((descriptor) => descriptor.schema),
      dbName,
      debug: ["query"],
      logger: (line) => queries.push(line.replace(/\x1b\[[0-9;]*m/g, "")),
    }),
  );
  await orm.schema.create();
  const datamap = new Datamap(orm);
  if (twitched) datamap.registerSubscriber(twitch);
  return { orm, datamap, queries, assembled };
}

async function stock(orm) {
  const em = orm.em.fork();
  const user = em.create(UserEntity, { slug: "beef" });
  for (const slug of ["italian", "spanish", "chess"]) em.create(DaemonEntity, { slug });
  await em.flush();
  em.setFilterParams("user", { user: user.id });
  const repositories = Object.fromEntries(Object.keys(DOMAINS).map((slug) => [slug, instantiate(em, slug)]));
  const modes = {
    italian: repositories.italian.mode.create({ type: "game", slug: "dojo" }),
    spanish: repositories.spanish.mode.create({ type: "game", slug: "dojo" }),
    chess: repositories.chess.mode.create({ type: "board", slug: "play" }),
  };
  await em.flush();
  return { em, user, repositories, modes };
}

specimen.describe("the mint — a repository per (daemon, kind) over ONE fixed schema", { sanitizeResources: false, sanitizeOps: false }, () => {
  let directory, file, rig, stocked, repositories;

  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir();
    file = `${directory}/mint.viva.db`;
    rig = await world(file);
    stocked = await stock(rig.orm);
    repositories = stocked.repositories;
    repositories.italian.literal.create({ slug: "casa", mode: stocked.modes.italian, traits: ["RETAINED"], trait: { RETAINED: { due: "2026-10-01", strength: 0.7 } } });
    repositories.italian.literal.create({ slug: "cane", mode: stocked.modes.italian, traits: ["RETAINED"], trait: { RETAINED: { due: "2026-09-01", strength: 0.2 } } });
    repositories.spanish.literal.create({ slug: "casa", mode: stocked.modes.spanish, traits: ["RETAINED"], trait: { RETAINED: { due: "2026-11-01" } } });
    repositories.chess.literal.create({ slug: "e4", mode: stocked.modes.chess, traits: ["RATED"], trait: { RATED: { elo: 1800 } } });
    repositories.chess.literal.create({ slug: "d4", mode: stocked.modes.chess, traits: ["RATED"], trait: { RATED: { elo: 1900 } } });
    await stocked.em.flush();
    stocked.em.clear();
    rig.queries.length = 0;
  });

  specimen.afterAll(async () => {
    await rig.orm.close();
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("names each repository after its daemon and kind; a null slug is the runtime's", () => {
    specimen.expect(KINDS.map((kind) => minted.italian[kind].repository.name)).toEqual([
      "ItalianLiteralRepository", "ItalianSymbolRepository", "ItalianNoteRepository", "ItalianModeRepository",
    ]);
    specimen.expect(minted.chess.literal.repository.name).toBe("ChessLiteralRepository");
    specimen.expect(minted.runtime.note.repository.name).toBe("RuntimeNoteRepository");
  });

  specimen.it("casa twice — one per daemon; each daemon's find sees its own rows only", async () => {
    const italian = await repositories.italian.literal.find({}, { orderBy: { slug: "asc" } });
    const spanish = await repositories.spanish.literal.find({});
    specimen.expect(italian.map((row) => `${row.slug}:${row.daemon.slug}`)).toEqual(["cane:italian", "casa:italian"]);
    specimen.expect(spanish.map((row) => `${row.slug}:${row.daemon.slug}`)).toEqual(["casa:spanish"]);
    specimen.expect(await repositories.chess.literal.count()).toBe(2);
    specimen.expect((await repositories.spanish.literal.findOne({ slug: "casa" })).trait.RETAINED.due).toBe("2026-11-01");
  });

  specimen.it("a where naming another daemon ANDs with the filter — [] , the scope wins silently", async () => {
    const rows = await repositories.italian.literal.find({ daemon: "spanish" });
    specimen.expect(rows).toEqual([]);
    specimen.expect(await repositories.italian.literal.count({ daemon: "spanish" })).toBe(0);
  });

  specimen.it("the scope rides every verb — findOneOrFail · findAll · updateOne · nativeUpdate · removeOne · populate", async () => {
    specimen.expect((await repositories.italian.literal.findOneOrFail({ slug: "casa" })).daemon.slug).toBe("italian");
    specimen.expect((await repositories.spanish.literal.findAll()).map((row) => row.slug)).toEqual(["casa"]);
    await repositories.italian.literal.updateOne({ slug: "casa" }, { ontology: "touched" });
    specimen.expect(await repositories.italian.literal.nativeUpdate({ slug: "casa" }, { ontology: "native" })).toBe(1);
    stocked.em.clear();
    const both = await stocked.em.find(LiteralEntity, { slug: "casa" }, { orderBy: { ontology: "asc" } });
    specimen.expect(both.map((row) => `${row.daemon.slug}:${row.ontology}`)).toEqual(["spanish:", "italian:native"]);
    repositories.italian.note.create({ slug: "memo", literal: await repositories.italian.literal.findOne({ slug: "casa" }) });
    await stocked.em.flush();
    stocked.em.clear();
    const [row] = await repositories.italian.literal.find({ slug: "casa" }, { populate: ["notes"] });
    specimen.expect(row.notes.getItems().map((note) => `${note.slug}:${note.daemon.slug}`)).toEqual(["memo:italian"]);
    specimen.expect(await repositories.italian.literal.count({ traits: "RETAINED" })).toBe(2);
    await repositories.italian.note.removeOne({ slug: "memo" });
    stocked.em.clear();
  });

  specimen.it("siblings — a trait verb reaches this.entities.<kind> and this.daemon through the same scope", async () => {
    specimen.expect(repositories.italian.literal.daemon).toBe("italian");
    specimen.expect(Object.keys(repositories.italian.literal.entities).sort()).toEqual(KINDS.slice().sort());
    specimen.expect(repositories.italian.literal.entities.mode).toBe(repositories.italian.mode);
    specimen.expect((await repositories.chess.literal.entities.mode.findOne({ slug: "play" })).daemon.slug).toBe("chess");
    specimen.expect(await repositories.italian.literal.entities.mode.findOne({ slug: "play" })).toBeNull();
  });

  specimen.it("due() orders by json_extract over the payload", async () => {
    rig.queries.length = 0;
    const rows = await repositories.italian.literal.due();
    specimen.expect(rows.map((row) => `${row.slug} ${row.trait.RETAINED.due}`)).toEqual(["cane 2026-09-01", "casa 2026-10-01"]);
    const select = rig.queries.find((line) => line.includes("from `Literal`"));
    specimen.expect(select).toMatch(/where .*json_extract\(l0\.trait, '\$\.RETAINED\.due'\) <= /);
    specimen.expect(select).toMatch(/order by json_extract\(l0\.trait, '\$\.RETAINED\.due'\) asc/);
  });

  specimen.it("a trait verb lives on its daemon's repository only", async () => {
    specimen.expect((await repositories.chess.literal.strongest()).map((row) => row.slug)).toEqual(["d4", "e4"]);
    specimen.expect(repositories.italian.literal.strongest).toBeUndefined();
    specimen.expect(repositories.chess.literal.due).toBeUndefined();
  });

  specimen.it("ensure is scoped: two daemons sharing a mode slug keep two rows", async () => {
    const italian = await repositories.italian.mode.ensure({ type: "game", slug: "dojo", name: "the italian dojo" });
    const spanish = await repositories.spanish.mode.ensure({ type: "game", slug: "dojo", name: "the spanish dojo" });
    await stocked.em.flush();
    specimen.expect([italian.daemon.slug, spanish.daemon.slug]).toEqual(["italian", "spanish"]);
    specimen.expect(italian.id).not.toBe(spanish.id);
    specimen.expect(await repositories.italian.mode.count({ slug: "dojo" })).toBe(1);
  });

  specimen.it("em.getRepository(LiteralEntity) stays the kernel's", () => {
    const kernelRepository = stocked.em.getRepository(LiteralEntity);
    specimen.expect(kernelRepository.constructor).toBe(LiteralRepository);
    specimen.expect(kernelRepository.due).toBeUndefined();
  });

  specimen.it("the diff after create names none of the kinds M1 rewrote", async () => {
    const rebuilt = [...(await rig.orm.schema.getUpdateSchemaSQL()).matchAll(/create table `(\w+)__temp_alter`/g)].map((match) => match[1]);
    specimen.expect(rebuilt.filter((table) => ["Daemon", "User", "Terminal", "Literal", "Symbol", "Note"].includes(table))).toEqual([]);
  });

  specimen.it("the live diff after create rebuilds only the enum-array kinds — mikro reads no items back from an enum array on SQLite", async () => {
    const rebuilt = [...(await rig.orm.schema.getUpdateSchemaSQL()).matchAll(/create table `(\w+)__temp_alter`/g)].map((match) => match[1]);
    specimen.expect(rebuilt.sort()).toEqual(["Buffer", "Intent", "Mode", "Thread"]);
  });

  specimen.it("a second boot through the libsql migrator writes no migration", async () => {
    const home = await Deno.makeTempDir();
    const datamap = { mountpoint: new Path(home), statics: { db: { file: "boot.viva.db" } } };
    const entities = rig.assembled.entities.map((descriptor) => descriptor.schema);
    const boot = async () => (await provider(datamap, { entities })).orm.close();
    const written = async () => (await Array.fromAsync(Deno.readDir(`${home}/migrations`))).map((entry) => entry.name).sort();
    await boot();
    const first = await written();
    await boot();
    specimen.expect(await written()).toEqual(first);
    specimen.expect(first.filter((name) => name.endsWith(".ts")).length).toBe(1);
    await Deno.remove(home, { recursive: true });
  });

  specimen.it("an expression index over a payload path", async () => {
    await rig.orm.em.getConnection().execute(`create index literal_due on Literal(json_extract(trait, '$.RETAINED.due'))`);
    const [index] = await rig.orm.em.getConnection().execute(`select name from sqlite_master where name = 'literal_due'`);
    specimen.expect(index.name).toBe("literal_due");
  });

  specimen.it("/metadata/datamap's strip names Literal once", () => {
    const names = Object.keys(shard.datamap.strip(rig.orm.getMetadata()));
    specimen.expect(names.filter((name) => name === "literal")).toEqual(["literal"]);
    specimen.expect(names.filter((name) => /italian|spanish|chess|runtime/.test(name))).toEqual([]);
  });

  specimen.it("the claim gate reads the daemon's vocabulary", async () => {
    const casa = await repositories.italian.literal.findOne({ slug: "casa" });
    specimen.expect(v.literal.trait(casa, "RETAINED", minted.italian.literal.schematics)).toEqual({ due: "2026-10-01", strength: 0.7 });
    specimen.expect(v.literal.trait(casa, "LABELED", minted.italian.literal.schematics)).toEqual({});
    specimen.expect(() => v.literal.trait(casa, "RETAINED")).toThrow("no trait RETAINED in a vocabulary of nothing");
    specimen.expect(() => v.literal.trait(casa, "RATED", minted.italian.literal.schematics)).toThrow("no trait RATED in a vocabulary of");
    specimen.expect(repositories.italian.literal.claim(casa, "RETAINED")).toEqual({ due: "2026-10-01", strength: 0.7 });
    specimen.expect(() => repositories.italian.literal.claim(casa, "RATED")).toThrow("no trait RATED in a vocabulary of LABELED · RETAINED");
    specimen.expect(repositories.chess.literal.claim({ traits: ["RATED"], trait: { RATED: { elo: "1800" } } }, "RATED")).toEqual({});
  });
});

specimen.describe("the entity half — methods on the ONE class, this the row, gated by the claim", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.it("a row whose daemon speaks the trait answers; a row of a daemon that does not throws; the method is the class's, not a daemon's", async () => {
    const rig = await world(":memory:");
    const stocked = await stock(rig.orm);
    const casa = stocked.repositories.italian.literal.create({ slug: "casa", mode: stocked.modes.italian, traits: ["RETAINED"], trait: { RETAINED: { due: "2026-10-01", strength: 0.7 } } });
    const e4 = stocked.repositories.chess.literal.create({ slug: "e4", mode: stocked.modes.chess, traits: ["RATED"], trait: { RATED: { elo: 1900 } } });
    await stocked.em.flush();
    specimen.expect(casa.assess()).toEqual({ overdue: true, strength: 0.7 });
    specimen.expect(e4.band()).toBe("strong");
    specimen.expect(() => e4.assess()).toThrow("RETAINED.assess: LiteralEntity e4 claims no RETAINED");
    specimen.expect(() => casa.band()).toThrow("RATED.band: LiteralEntity casa claims no RATED");
    specimen.expect(typeof LiteralEntity.prototype.assess).toBe("function");
    await rig.orm.close();
  });

  specimen.it("two daemons' traits naming one entity method collide at boot; the same trait twice is one install", () => {
    const CLASHING = traits.define("CLASHING", { entity: { assess() {} } });
    specimen.expect(() => traits.entity(LiteralEntity, [CLASHING], "french")).toThrow("trait CLASHING.entity.assess collides with RETAINED.entity.assess on LiteralEntity");
    specimen.expect(traits.entity(LiteralEntity, [RETAINED], "italian")).toBe(LiteralEntity);
    specimen.expect(() => traits.collide([RETAINED, CLASHING])).toThrow("trait CLASHING.entity.assess collides with RETAINED.entity.assess");
  });
});

specimen.describe("gather — one name, one trait; a verb collision is a boot fault", () => {
  specimen.it("two traits naming one verb throw", () => {
    const SCHEDULED = traits.define("SCHEDULED", { repository: { due() {} } });
    specimen.expect(() => gather(kernel, DOMAINS.italian, [{ traits: { literal: [SCHEDULED] } }], "literal")).toThrow(
      "trait SCHEDULED.repository.due collides with RETAINED.repository.due",
    );
    specimen.expect(() => minting("italian", DOMAINS.italian, [{ traits: { literal: [SCHEDULED] } }])).toThrow("collides");
  });

  specimen.it("one name declared twice folds to the first", () => {
    const LABELED = traits.define("LABELED", { schematic: v.object({ other: v.string() }) });
    const held = gather(kernel, { traits: { literal: [LABELED] } }, [], "literal");
    specimen.expect(held.map((each) => each.name)).toEqual(["LABELED"]);
    specimen.expect(held[0]).toBe(kernel.literal[0]);
  });
});

specimen.describe("Note — one class, daemon nullable", { sanitizeResources: false, sanitizeOps: false }, () => {
  let rig, stocked;

  specimen.beforeAll(async () => {
    rig = await world(":memory:");
    stocked = await stock(rig.orm);
  });

  specimen.afterAll(() => rig.orm.close());

  specimen.it("a null-daemon note goes through the runtime's repository and no daemon's", async () => {
    const note = stocked.repositories.runtime.note.create({ slug: "memo", traits: ["LABELED"], trait: { LABELED: { name: "memo" } } });
    await stocked.em.flush();
    specimen.expect(note.daemon).toBeNull();
    specimen.expect((await stocked.repositories.runtime.note.find({})).map((row) => row.slug)).toEqual(["memo"]);
    specimen.expect(await stocked.repositories.italian.note.find({})).toEqual([]);
  });

  specimen.it("round-trips: payload, owner, symbols, daemon", async () => {
    const greeting = stocked.repositories.italian.symbol.create({ slug: "greeting", mode: stocked.modes.italian });
    stocked.repositories.italian.note.create({
      slug: "preset.meet",
      mode: stocked.modes.italian,
      user: stocked.user,
      traits: ["LABELED"],
      trait: { LABELED: { name: "meet", description: "the dojo's meet preset" } },
      symbols: [greeting],
    });
    await stocked.em.flush();
    stocked.em.clear();
    const row = await stocked.repositories.italian.note.findOne({ slug: "preset.meet" }, { populate: ["symbols"] });
    specimen.expect(row.daemon.slug).toBe("italian");
    specimen.expect(row.user.id).toBe(stocked.user.id);
    specimen.expect(row.traits).toEqual(["LABELED"]);
    specimen.expect(row.trait).toEqual({ LABELED: { name: "meet", description: "the dojo's meet preset" } });
    specimen.expect(row.symbols.getItems().map((symbol) => symbol.slug)).toEqual(["greeting"]);
    specimen.expect(v.literal.trait(row, "LABELED", minted.italian.note.schematics)).toEqual({ name: "meet", description: "the dojo's meet preset" });
    specimen.expect((await stocked.repositories.italian.note.index()).map((each) => each.slug)).toEqual(["preset.meet"]);
  });

  specimen.it("the coalesce unique: two runtime notes of one slug are refused", async () => {
    const em = rig.orm.em.fork();
    em.setFilterParams("user", { user: stocked.user.id });
    const runtimeNotes = new minted.runtime.note.repository(em, NoteEntity);
    runtimeNotes.create({ slug: "twice" });
    runtimeNotes.create({ slug: "twice" });
    await specimen.expect(em.flush()).rejects.toThrow(UniqueConstraintViolationException);
  });

  specimen.it("the coalesce unique: a runtime note and a mode's note may share a slug", async () => {
    const em = rig.orm.em.fork();
    em.setFilterParams("user", { user: stocked.user.id });
    new minted.runtime.note.repository(em, NoteEntity).create({ slug: "shared" });
    new minted.italian.note.repository(em, NoteEntity).create({ slug: "shared", mode: stocked.modes.italian.id });
    await em.flush();
    specimen.expect(await em.count(NoteEntity, { slug: "shared" })).toBe(2);
  });

  specimen.it("the user filter: a shared note passes every user, a memory only its own", async () => {
    const em = rig.orm.em.fork();
    em.setFilterParams("user", { user: stocked.user.id });
    const stranger = em.create(UserEntity, { slug: "stranger" });
    const notes = new minted.runtime.note.repository(em, NoteEntity);
    notes.create({ slug: "filter.shared" });
    notes.create({ slug: "filter.mine", user: stocked.user.id });
    notes.create({ slug: "filter.theirs", user: stranger });
    await em.flush();
    const seen = await notes.find({ slug: { $like: "filter.%" } }, { orderBy: { slug: "asc" } });
    specimen.expect(seen.map((row) => row.slug)).toEqual(["filter.mine", "filter.shared"]);
  });

  specimen.it("the unique is a single expression index", async () => {
    const [index] = await rig.orm.em.getConnection().execute(`select sql from sqlite_master where name = 'Note_scope_slug_unique'`);
    specimen.expect(index?.sql).toMatch(/coalesce\(`daemon_slug`, ''\), coalesce\(`mode_id`, ''\), coalesce\(`user_id`, ''\), `slug`/);
  });
});

specimen.describe("userspace with no mode is the runtime's own", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.it("a thread and a buffer with no mode; Buffer's twitch names it home", async () => {
    const rig = await world(":memory:");
    const stocked = await stock(rig.orm);
    const thread = stocked.em.create(ThreadEntity, { user: stocked.user });
    await stocked.em.flush();
    const home = await stocked.em.getRepository(BufferEntity).create({ thread });
    const dojo = await stocked.em.getRepository(BufferEntity).create({ thread, mode: stocked.modes.italian });
    await stocked.em.flush();
    specimen.expect(thread.mode).toBeNull();
    specimen.expect([home.trait.LABELED.name, dojo.trait.LABELED.name]).toEqual(["home #0", "dojo #1"]);
    await rig.orm.close();
  });
});

specimen.describe("Literal's symbol · ontology fold fires from the twitch, not a subscriber", { sanitizeResources: false, sanitizeOps: false }, () => {
  const create = async (twitched) => {
    const rig = await world(":memory:", { twitched });
    const stocked = await stock(rig.orm);
    const word = stocked.repositories.italian.symbol.create({ slug: "word", mode: stocked.modes.italian, traits: ["TOPOGRAPHICAL"] });
    const noun = stocked.repositories.italian.symbol.create({ slug: "word.noun", mode: stocked.modes.italian });
    stocked.repositories.italian.literal.create({ slug: "casa", mode: stocked.modes.italian });
    await stocked.em.flush();
    // the link phase's own touch (traits/dataset.js): a fresh row folds on its first update, never on create
    const literal = await stocked.repositories.italian.literal.findOne({ slug: "casa" }, { populate: ["symbols"] });
    literal.symbols.add(word, noun);
    literal.assign({ updatedAt: new Date() });
    await stocked.em.flush();
    return { rig, literal };
  };

  specimen.it("the kernel exports no subscriber; the twitch is the descriptor's", () => {
    specimen.expect(runtime.LiteralSubscriber).toBeUndefined();
    specimen.expect(runtime.BufferSubscriber).toBeUndefined();
    specimen.expect(runtime.literal.subscriber).toBeUndefined();
    specimen.expect(runtime.literal.twitch).toBeInstanceOf(Vector);
    specimen.expect(runtime.buffer.twitch).toBeInstanceOf(Vector);
  });

  specimen.it("registered through datamap.registerSubscriber(twitch), the fold stamps symbol and ontology", async () => {
    const { rig, literal } = await create(true);
    specimen.expect(literal.ontology).toBe("word");
    specimen.expect(literal.symbol).toEqual({ word: "noun" });
    await rig.orm.close();
  });

  specimen.it("with no twitch registered nothing folds — no hidden subscriber", async () => {
    const { rig, literal } = await create(false);
    specimen.expect(literal.ontology).toBe("");
    specimen.expect(literal.symbol).toEqual({});
    await rig.orm.close();
  });
});
