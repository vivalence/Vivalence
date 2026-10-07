import { Datamap, Twitch, sleep, specimen } from "@vivalence/typology";
import { EntitySchema, MikroORM } from "@mikro-orm/sqlite";

class ProbeEntity {
  id = crypto.randomUUID();
  slug = "";
}

class NoteEmbedEntity {
  text = "";
}

const NoteEmbedSchema = new EntitySchema({ class: NoteEmbedEntity, embeddable: true, properties: { text: { type: "string" } } });

const ProbeSchema = new EntitySchema({
  class: ProbeEntity,
  tableName: "Probe",
  properties: {
    id: { type: "string", primary: true },
    slug: { type: "string" },
    note: { kind: "embedded", entity: () => NoteEmbedEntity, object: true, nullable: true },
  },
});

const open = async () => {
  const orm = await MikroORM.init({ dbName: ":memory:", contextName: "probe", entities: [ProbeSchema, NoteEmbedSchema] });
  await orm.schema.create();
  return new Datamap(orm);
};

specimen.describe("Datamap — the runtime's face over an ORM", () => {
  specimen.it("keys one repository per concrete entity, named for its class, beside the em; an embeddable is no repository", async () => {
    const datamap = await open();
    specimen.expect(Object.keys(datamap.entities)).toEqual(["em", "probe"]);
    specimen.expect(datamap.orm.em.name).toBe("probe");
    specimen.expect(datamap.getMetadata().get("ProbeEntity").tableName).toBe("Probe");
    await datamap.close();
  });

  specimen.it("shard.scope runs a task in its own request context; shard.bind sets a filter parameter on it", async () => {
    const datamap = await open();
    const seen = [];
    const bound = datamap.shard.bind("user", (ctx) => ({ user: ctx.user }));
    await datamap.shard.scope(async () => {
      datamap.entities.probe.create({ slug: "one" });
      await datamap.entities.em.flush();
      await bound({ user: "u1" }, async () => seen.push(datamap.entities.em.getContext().getFilterParams("user")));
    });
    specimen.expect(seen).toEqual([{ user: "u1" }]);
    specimen.expect(await datamap.shard.scope(() => datamap.entities.probe.count())).toBe(1);
    await datamap.close();
  });

  specimen.it("registerSubscriber takes a Twitch — every ORM event is a signal on it, the kind's name in the path", async () => {
    const datamap = await open();
    const heard = [];
    const twitch = new Twitch()
      .open("/before/probe/create", (ctx) => heard.push(`before:${ctx.input.entity.slug}`))
      .open("/after/probe/create", (ctx) => heard.push(`after:${ctx.input.entity.slug}`));
    datamap.registerSubscriber(twitch);
    await datamap.shard.scope(async () => {
      datamap.entities.probe.create({ slug: "two" });
      await datamap.entities.em.flush();
    });
    await sleep.ms(10);
    specimen.expect(heard).toEqual(["before:two", "after:two"]);
    await datamap.close();
  });
});
