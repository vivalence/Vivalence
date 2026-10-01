import { EntitySchema, EntityRepository, Collection, wrap, helper, Cascade, types, defineConfig } from "@mikro-orm/core";
import { MikroORM, SqliteDriver, NodeSqliteDialect } from "@mikro-orm/sql";
import { Migrator } from "@mikro-orm/migrations";

const stage = Deno.args[0];
const dbFile = Deno.args[1] ?? ":memory:";
const here = new URL(".", import.meta.url).pathname;

class Base {}
class Author extends Base {}
class Book extends Base {}
class Label {}
class Address {}
class Ghost {}

const BaseSchema = new EntitySchema({
  class: Base,
  abstract: true,
  properties: {
    id: { type: types.integer, primary: true },
    createdAt: { type: types.datetime, onCreate: () => new Date() },
    updatedAt: { type: types.datetime, onCreate: () => new Date(), onUpdate: () => new Date() },
  },
});

const AddressSchema = new EntitySchema({
  class: Address,
  embeddable: true,
  properties: { city: { type: types.string }, street: { type: types.string, nullable: true } },
});

const AuthorSchema = new EntitySchema({
  class: Author,
  extends: BaseSchema,
  properties: {
    name: { type: types.string },
    roles: { type: types.json, nullable: true },
    address: { kind: "embedded", entity: () => Address, object: true, nullable: true },
    mentor: { kind: "m:1", entity: () => Author, nullable: true },
    mentees: { kind: "1:m", entity: () => Author, mappedBy: "mentor" },
    books: { kind: "1:m", entity: () => Book, mappedBy: "author", cascade: [Cascade.ALL] },
    stamp: stage === "three" ? { type: types.string, nullable: true, defaultRaw: "'x'" } : { type: types.string, defaultRaw: "'x'" },
  },
});

const bookProperties = {
  title: { type: types.string },
  author: { kind: "m:1", entity: () => Author },
  labels: { kind: "m:n", entity: () => Label, owner: true, pivotTable: "book_labels" },
};
if (stage === "two" || stage === "three") {
  bookProperties.isbn = { type: types.string, nullable: true };
  bookProperties.editor = { kind: "m:1", entity: () => Author, nullable: true };
}
if (stage === "three") {
  bookProperties.title = { type: types.string, nullable: true };
}
const BookSchema = new EntitySchema({
  class: Book,
  extends: BaseSchema,
  properties: bookProperties,
  filters: {
    titled: { name: "titled", cond: (args) => (args?.prefix ? { title: { $like: `${args.prefix}%` } } : {}), default: true },
  },
});

const LabelSchema = new EntitySchema({
  class: Label,
  properties: stage === "three"
    ? { id: { type: types.integer, primary: true }, name: { type: types.string }, color: { type: types.string, nullable: true } }
    : { id: { type: types.integer, primary: true }, name: { type: types.string } },
});

class GhostRepository extends EntityRepository {
  async findAll() { return [{ id: 1, label: "in-memory" }]; }
}
const GhostSchema = new EntitySchema({
  class: Ghost,
  expression: () => { throw new Error("virtual entity must not be queried"); },
  repository: () => GhostRepository,
  properties: { id: { type: types.integer }, label: { type: types.string } },
});

const events = [];
class Subscriber {
  beforeCreate(args) { events.push(`beforeCreate:${helper(args.entity).__meta.className}`); }
  afterFlush() { events.push("afterFlush"); }
}

const queries = [];
const orm = await MikroORM.init(defineConfig({
  driver: SqliteDriver,
  dbName: dbFile,
  driverOptions: new NodeSqliteDialect(dbFile),
  entities: [BaseSchema, AddressSchema, AuthorSchema, BookSchema, LabelSchema, GhostSchema],
  subscribers: [new Subscriber()],
  extensions: [Migrator],
  baseDir: here,
  contextName: "smoke",
  loadStrategy: "balanced",
  migrations: { path: "./migrations", transactional: Deno.env.get("TX") === "1", emit: "ts" },
  debug: ["query"],
  logger: (line) => queries.push(line),
}));

const metaWalk = [...orm.getMetadata().getAll().values()].map((meta) => `${meta.className}${meta.abstract ? "(abstract)" : ""}${meta.embeddable ? "(embeddable)" : ""}${meta.virtual ? "(virtual)" : ""}`);
console.log("getAll() is Map:", orm.getMetadata().getAll() instanceof Map, "->", [...new Set(metaWalk)].join(", "));
console.log("pivot:", orm.getMetadata().getByClassName("Book").properties.labels.pivotTable, "kind:", orm.getMetadata().getByClassName("Book").properties.author.kind);

if (stage === "meta") { const b = orm.getMetadata().getByClassName("Book"); const a = orm.getMetadata().getByClassName("Author"); const show = (p) => ({ name: p.name, kind: p.kind, type: p.type, entity: typeof p.entity, target: p.target?.name, targetMeta: p.targetMeta?.className, pivotEntity: typeof p.pivotEntity === "function" ? "class:" + p.pivotEntity.name : p.pivotEntity, pivotTable: p.pivotTable, embeddable: p.embeddable?.name, object: p.object, runtimeType: p.runtimeType }); console.log(JSON.stringify([show(b.properties.author), show(b.properties.labels), show(a.properties.address), show(a.properties.roles), show(a.properties.mentees)])); console.log("extends:", typeof a.extends, a.extends?.constructor?.name, "root:", a.root.className, "props from base:", Object.keys(a.properties).slice(0,4).join(","), "tableName:", a.tableName, "collection:", a.collection); } else if (stage === "memory") {
  await orm.schema.create();
  const em = orm.em.fork();
  const mentor = em.create(Author, { name: "M", roles: ["a", "b"], address: { city: "Berlin" } });
  const author = em.create(Author, { name: "A", mentor });
  const label = em.create(Label, { name: "l1" });
  const book = em.create(Book, { title: "Hello", author });
  book.labels.add(label);
  await em.flush();
  const fork = orm.em.fork();
  fork.setFilterParams("titled", { prefix: "He" });
  const books = await fork.find(Book, {}, { populate: ["author.mentor", "labels"] });
  console.log("filtered books:", books.length, books[0].author.mentor.name, books[0].labels.length, "params:", JSON.stringify(fork.getFilterParams("titled")));
  fork.setFilterParams("titled", { prefix: "Zz" });
  console.log("filtered out:", (await fork.find(Book, {})).length);
  const updated = await fork.nativeUpdate(Author, { name: "A" }, { name: "A2" });
  const raw = await fork.getConnection().execute("select count(*) as c from author");
  console.log("nativeUpdate:", updated, "raw:", JSON.stringify(raw), "ghost:", JSON.stringify(await fork.getRepository(Ghost).findAll()));
  console.log("events:", events.join(","));
  await orm.schema.refresh();
  console.log("refresh ok, authors after refresh:", (await orm.em.fork().count(Author)));
} else {
  const migrator = orm.migrator;
  if (stage === "three") {
    await orm.em.getConnection().execute("insert into author (id, created_at, updated_at, name, stamp) values (1, 0, 0, 'a', 'x')");
    await orm.em.getConnection().execute("insert into book (id, created_at, updated_at, title, author_id) values (1, 0, 0, 't', 1)");
  }
  console.log("checkSchema() before:", await migrator.checkSchema());
  const created = await migrator.create(undefined, false, stage === "one");
  console.log("created:", created.fileName);
  console.log(created.diff.up.join("\n"));
  console.log("pending:", (await migrator.getPending()).map((m) => m.name).join(","));
  await migrator.up();
  console.log("checkSchema() after:", await migrator.checkSchema());
  const fks = await orm.em.getConnection().execute("pragma foreign_key_list(book)");
  console.log("book FKs:", JSON.stringify(fks.map((fk) => `${fk.from}->${fk.table}.${fk.to}`)));
  const cols = await orm.em.getConnection().execute("pragma table_info(book)");
  console.log("book cols:", cols.map((c) => c.name).join(","));
  const idx = await orm.em.getConnection().execute("select name from sqlite_master where type = 'index' and tbl_name = 'book'");
  console.log("book indexes:", idx.map((i) => i.name).join(","));
  console.log("fk pragma:", JSON.stringify(await orm.em.getConnection().execute("pragma foreign_keys")));
}
await orm.close();
