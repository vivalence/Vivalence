// limit: 3000 chars
import { defineConfig, EntitySchema, MikroORM } from "@mikro-orm/sqlite";

const File = new EntitySchema({
  name: "File",
  properties: { id: { type: "string", primary: true }, path: { type: "string" } },
});

const dir = await Deno.makeTempDir({ prefix: "attached-404-" });
const seen = [];
let orm;

const subscriber = {
  getSubscribedEntities: () => [File],
  async afterCreate(args) {
    const id = args.entity.id;
    const reader = orm.em.fork();
    const pending = reader.findOne(File, { id }).then((row) => seen.push({ id, phase: "detached read", found: row !== null }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    seen.push({ id, phase: "afterCreate returns", pendingSettled: seen.some((s) => s.id === id) });
    pending.catch(() => {});
  },
};

orm = await MikroORM.init(defineConfig({ dbName: `${dir}/probe.db`, entities: [File], subscribers: [subscriber] }));
await orm.schema.create();

try {
  const em = orm.em.fork();
  em.create(File, { id: "a", path: "bundle/a.mjs" });
  em.create(File, { id: "b", path: "bundle/b.mjs" });
  await em.flush();
  seen.push({ phase: "flush returned" });
  await new Promise((resolve) => setTimeout(resolve, 50));
  console.log(JSON.stringify(seen, null, 1));
} finally {
  await orm.close();
  await Deno.remove(dir, { recursive: true });
}
