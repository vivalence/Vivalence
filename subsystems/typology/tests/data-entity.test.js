import { EntitySchema, MikroORM } from "@mikro-orm/sqlite";
import { specimen } from "@vivalence/typology";
import { DataEntity, DataRepository } from "@vivalence/typology/entities";

class Held extends DataEntity {
  id = "";
  trait = {};
}

const HeldSchema = new EntitySchema({ class: Held, tableName: "Held", repository: () => DataRepository, properties: { id: { type: "string", primary: true }, trait: { type: "json" } } });

specimen.describe("DataRepository.updateOne — a JSON column it names is replaced whole", () => {
  specimen.it("a column sent with one trait drops the others; an empty map clears it", async () => {
    const orm = await MikroORM.init({ dbName: ":memory:", contextName: "held", entities: [HeldSchema] });
    await orm.schema.create();
    const em = orm.em.fork();
    em.persist(Object.assign(new Held(), { id: "th1", trait: { LABELED: { name: "hi" }, INTELLIGENT: { tune: "slow", effort: "low" } } }));
    await em.flush();
    const updated = await em.getRepository(Held).updateOne({ id: "th1" }, { trait: { INTELLIGENT: { tune: "fast" } } });
    specimen.expect(updated.trait).toEqual({ INTELLIGENT: { tune: "fast" } });

    const cleared = await em.getRepository(Held).updateOne({ id: "th1" }, { trait: {} });
    specimen.expect(cleared.trait).toEqual({});

    const read = await orm.em.fork().findOneOrFail(Held, { id: "th1" });
    specimen.expect(read.trait).toEqual({});
    await orm.close();
  });
});
