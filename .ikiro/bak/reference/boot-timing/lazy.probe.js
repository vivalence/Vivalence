// limit: 2500 chars
import { defineConfig, EntitySchema, MikroORM } from "@mikro-orm/sqlite";
import { serialize, types } from "@mikro-orm/core";

const schema = (name, options) =>
  new EntitySchema({
    name,
    properties: {
      id: { type: types.string, primary: true },
      slug: { type: types.string },
      sources: { type: types.json, defaultRaw: `'[]'`, ...options },
    },
  });
const Lazy = schema("Lazy", { lazy: true });
const Hidden = schema("Hidden", { lazy: true, hidden: true });

const orm = await MikroORM.init(defineConfig({ dbName: ":memory:", entities: [Lazy, Hidden] }));
await orm.schema.create();
const SOURCES = [{ path: "/machine/types.js", bytes: 15842, mtime: "2026-11-16T09:21:23.839Z" }];
const seen = {};
try {
  for (const kind of [Lazy, Hidden]) {
    const writer = orm.em.fork();
    const written = writer.create(kind, { id: "a", slug: "dojo", sources: SOURCES });
    await writer.flush();
    const found = await orm.em.fork().findOne(kind, { id: "a" });
    const asked = await orm.em.fork().findOne(kind, { id: "a" }, { populate: ["sources"] });
    seen[kind.meta.className] = {
      "pushed after the write": Object.keys(serialize(written)),
      "plain find": Object.keys(serialize(found)),
      "plain find holds it": found.sources !== undefined,
      "find, populate sources": Object.keys(serialize(asked)),
      "asked holds it server-side": asked.sources?.length ?? null,
    };
  }
  console.log(JSON.stringify(seen, null, 2));
} finally {
  await orm.close();
}
