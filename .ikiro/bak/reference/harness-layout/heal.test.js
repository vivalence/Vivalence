import { belt, specimen, v } from "@vivalence/typology";
import { ThreadEntity } from "@vivalence/runtime";
import { seed } from "../../../systems/runtime/tests/scenarios/datamap.js";

const RETIRED = { INTELLIGENT: "HARNESSED", VOCAL: "CONVERSATIONAL" };
const heir = (name) => RETIRED[name] ?? name;

const vocabulary = v.object(
  {
    HARNESSED: v.object({ tier: v.string().default("capable"), rounds: v.integer().default(12) }).default({}).optional(),
    CONVERSATIONAL: v.object({ language: v.array(v.string()).default([]) }).default({}).optional(),
  },
  { retired: RETIRED },
);

const heal = (entity, held) => ({
  traits: entity.traits.map((name) => held.retired[name] ?? name),
  trait: Object.fromEntries(Object.entries(entity.trait).map(([name, data]) => [held.retired[name] ?? name, data])),
});

specimen.describe("Q40 — a retired trait name heals at the cast", () => {
  specimen.it("v.object keeps a retired table as schema metadata", () => {
    const answer = { retired: vocabulary.retired, json: JSON.parse(JSON.stringify(vocabulary)).retired };
    console.log(JSON.stringify(answer, null, 2));
    specimen.expect(vocabulary.retired).toEqual(RETIRED);
  });

  specimen.it("a stored thread wearing the old names casts whole once healed", () => {
    const stored = { id: "th-1", traits: ["INTELLIGENT", "VOCAL"], trait: { INTELLIGENT: { tier: "fast", rounds: 21 }, VOCAL: {} } };
    const healed = heal(stored, vocabulary);
    const trait = belt.traits.cast({ ...stored, ...healed }, vocabulary);
    console.log(JSON.stringify({ healed, trait }, null, 2));
    specimen.expect(healed.traits).toEqual(["HARNESSED", "CONVERSATIONAL"]);
    specimen.expect(trait.HARNESSED).toEqual({ tier: "fast", rounds: 21 });
    specimen.expect(() => belt.traits.cast(stored, vocabulary)).toThrow("no trait INTELLIGENT");
  });

  specimen.it("mikro onLoad: a stored row's names heal at load and persist at the next flush", async () => {
    const { fixtures, em, datamap } = await seed();
    const thread = em.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: [] });
    await em.flush();
    const connection = em.getConnection();
    await connection.execute(
      `update thread set traits = '["INTELLIGENT","VOCAL"]', trait = '{"INTELLIGENT":{"tier":"fast"},"VOCAL":{}}' where id = ?`,
      [thread.id],
    );
    const loads = [];
    datamap.orm.em.getEventManager().registerSubscriber({
      getSubscribedEntities: () => [ThreadEntity],
      onLoad(args) {
        loads.push(args.entity.traits.join(" · "));
        Object.assign(args.entity, {
          traits: args.entity.traits.map(heir),
          trait: Object.fromEntries(Object.entries(args.entity.trait).map(([name, data]) => [heir(name), data])),
        });
      },
    });
    const fork = em.fork();
    const loaded = await fork.findOneOrFail(ThreadEntity, { id: thread.id }, { filters: false });
    const seen = { traits: [...loaded.traits], trait: { ...loaded.trait } };
    let flushed = null;
    try {
      await fork.flush();
    } catch (error) {
      flushed = error.message.split("\n")[0];
    }
    const [row] = await connection.execute(`select traits, trait from thread where id = ?`, [thread.id]);
    const answer = { loads, seen, flushed, row };
    console.log(JSON.stringify(answer, null, 2));
  });
});
