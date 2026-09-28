import { expect } from "@std/expect";
import { MikroORM } from "@mikro-orm/core";
import { Controller, Path, Span, Vector, shape, shard } from "@vivalence/typology";
import { sets, ThreadEntity, UserEntity, ModeEntity } from "@vivalence/runtime";
import { assemble } from "../../../../commons/fixtures/data/assemble.js";
import { process } from "./lib.js";
import { Datamap, provider } from "./datamap.class.js";

const loose = { sanitizeOps: false, sanitizeResources: false };
const tiers = () => assemble([sets.daemon, sets.kernel, sets.userspace, sets.transient, { process }]);
const options = ({ entities, subscribers }) => ({ entities: entities.map((descriptor) => descriptor.schema), subscribers: subscribers.map((Subscriber) => new Subscriber()) });

Deno.test("the runtime's datamap: a Datamap, its context name a static", loose, async () => {
  const datamap = await provider({ statics: { context: { name: "runtime" } } }, { entities: [process.schema] });
  expect(datamap instanceof Datamap).toBe(true);
  expect(datamap.orm instanceof MikroORM).toBe(true);
  expect(datamap.orm.em.name).toBe("runtime");
  expect(Object.keys(datamap.entities)).toEqual(["em", "process"]);
  expect(Object.keys(datamap.shard).sort()).toEqual(["bind", "carry", "scope"]);
  await datamap.close();
});

Deno.test("a daemon's datamap in memory: tiers, subscribers, a twitch, a scope, a strip", loose, async () => {
  const assembled = tiers();
  const datamap = await provider({ statics: {} }, options(assembled));
  expect(Object.keys(datamap.entities).filter((key) => key !== "em").sort()).toEqual(assembled.entities.map((descriptor) => descriptor.type).sort());
  const heard = [];
  const twitch = new Vector().open("/after/thread/create", () => heard.push("thread")).open("/after/process/create", () => heard.push("process"));
  datamap.registerSubscriber(shape.subscriber(twitch));
  const literal = await datamap.shard.scope(async () => {
    const em = datamap.orm.em.getContext();
    const user = em.create(UserEntity, { roles: ["USER"], config: {} });
    const mode = em.create(ModeEntity, { slug: "test", type: "test", traits: [], installed: "installed" });
    const word = em.create(sets.kernel.symbol.entity, { slug: "word", traits: ["TOPOGRAPHICAL"] });
    await em.flush();
    em.setFilterParams("user", { user: user.id });
    em.create(ThreadEntity, { user: user.id, mode: mode.id, traits: [] });
    const made = em.create(sets.kernel.literal.entity, { slug: "hello", traits: [], trait: {} });
    made.symbols.add(word);
    await em.flush();
    return made;
  });
  await datamap.shard.scope(() => datamap.entities.process.create({ slug: "chess", mask: {}, controller: new Controller({ stdout: new Span("chess") }) }));
  expect(heard).toEqual(["thread", "process"]);
  expect(literal.ontology).toBe("word");
  expect(Object.keys(shard.datamap.strip(datamap.getMetadata())).sort()).toEqual(Object.keys(datamap.entities).filter((key) => key !== "em").sort());
  await datamap.close();
});

Deno.test("seated: a file, a migrations directory, the file its context name", loose, async () => {
  const root = new Path(new URL("./mountpoint/service", import.meta.url).pathname);
  await Deno.remove(root.absolute, { recursive: true }).catch(() => null);
  await Deno.mkdir(root.absolute, { recursive: true });
  const datamap = await provider({ mountpoint: root, statics: { db: { file: "service.viva.db" } } }, options(tiers()));
  const found = [];
  for await (const entry of Deno.readDir(root.absolute)) found.push(entry.name);
  expect(found.sort()).toEqual(["migrations", "service.viva.db"]);
  expect(datamap.orm.em.name).toBe("service.viva.db");
  await datamap.close();
});

Deno.test("two datamaps nest: distinct names keep their forks apart, one name crosses them", loose, async () => {
  const runtime = await provider({ statics: { context: { name: "runtime" } } }, { entities: [process.schema] });
  const daemon = await provider({ statics: {} }, { entities: [process.schema] });
  const twin = await provider({ statics: {} }, { entities: [process.schema] });
  const seen = await runtime.shard.scope(() => daemon.shard.scope(() => ({
    runtime: runtime.orm.em.getContext(false) !== runtime.orm.em,
    daemon: daemon.orm.em.getContext(false) !== daemon.orm.em,
    twin: twin.orm.em.getContext(false) === daemon.orm.em.getContext(false),
  })));
  expect(seen).toEqual({ runtime: false, daemon: true, twin: true });
  await Promise.all([runtime.close(), daemon.close(), twin.close()]);
});

Deno.test("typology's shards read the Datamap: inject scopes a request", loose, async () => {
  const datamap = await provider({ statics: {} }, { entities: [process.schema] });
  const seen = [];
  const inject = shard.datamap.inject({ ...datamap, shard: { context: datamap.shard.scope, carry: datamap.shard.carry } });
  await inject({ response: {} }, async () => seen.push(datamap.orm.em.getContext() !== datamap.orm.em));
  expect(seen).toEqual([true]);
  await datamap.close();
});
