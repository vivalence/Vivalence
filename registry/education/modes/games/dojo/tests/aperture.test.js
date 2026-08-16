import { specimen } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";

import * as dojo from "../dojo.viva.js";

specimen.describe("dojo aperture", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await mountMode(dojo);
  });

  specimen.afterAll(async () => {
    await scenario?.orm?.close();
  });

  specimen.it("/symbols speaks the symbol repository — slug or LABELED name search, traits, literal counts", async () => {
    await scenario.scoped(async () => {
      const call = (input) => scenario.authedConn.call("/mode/game/dojo/symbols", input);
      const rows = await call({});
      specimen.expect(rows.length).toBeGreaterThanOrEqual(3);
      specimen.expect(rows[0].literals).toBeGreaterThanOrEqual(rows[rows.length - 1].literals);
      const greeting = rows.find((row) => row.slug === "greeting");
      specimen.expect(greeting.literals).toBeGreaterThanOrEqual(1);
      specimen.expect(greeting.traits).toEqual(["ONTOLOGICAL"]);

      const bySlug = await call({ search: "greet" });
      specimen.expect(bySlug.map((row) => row.slug)).toEqual(["greeting"]);

      const byName = await call({ search: "presente" });
      specimen.expect(byName.map((row) => row.slug)).toEqual(["word.tense.presente"]);
      specimen.expect(byName[0].name).toBe("presente");

      const structural = await call({ traits: ["STRUCTURAL"] });
      specimen.expect(structural.length).toBe(0);
      const limited = await call({ limit: 2 });
      specimen.expect(limited.length).toBe(2);
    });
  });

  specimen.it("/traits counts the literal traits under the ontology guard", async () => {
    await scenario.scoped(async () => {
      const rows = await scenario.authedConn.call("/mode/game/dojo/traits", {});
      const by = Object.fromEntries(rows.map((row) => [row.name, row.literals]));
      specimen.expect(by.TRANSLATED).toBeGreaterThanOrEqual(5);
      specimen.expect(by.VOCALIZED).toBe(1);
      specimen.expect(by.ANNOTATED).toBe(1);
    });
  });

  specimen.it("/resolve speaks the literal repository grammar — symbols, traits, search, ontology", async () => {
    await scenario.scoped(async () => {
      const call = (set) => scenario.authedConn.call("/mode/game/dojo/resolve", { set });
      const whole = await call([{ pick: "all" }]);
      const scoped = await call([{ pick: "all", where: { symbols: ["greeting"] } }]);
      const anyOf = await call([{ pick: "all", where: { symbols: { $in: ["greeting", "nope.missing"] } } }]);
      const none = await call([{ pick: "all", where: { symbols: { $none: ["greeting"] } } }]);
      const words = await call([{ pick: "all", where: { ontology: "word" } }]);
      specimen.expect(whole.total).toBeGreaterThanOrEqual(scoped.total);
      specimen.expect(scoped.total).toBeGreaterThanOrEqual(1);
      specimen.expect(anyOf.clauses[0].count).toBe(scoped.clauses[0].count);
      specimen.expect(none.clauses[0].count + scoped.clauses[0].count).toBe(whole.clauses[0].count);
      specimen.expect(words.clauses[0].literals.every((row) => row.ontology === "word")).toBe(true);

      const searched = await call([{ pick: "all", where: { search: "hello" } }]);
      specimen.expect(searched.total).toBeGreaterThanOrEqual(1);

      const spoken = await call([{ pick: "all", where: { traits: ["VOCALIZED"] } }]);
      specimen.expect(spoken.clauses[0].literals.map((row) => row.slug)).toEqual(["thanks"]);
      const overlap = await call([{ pick: "all", where: { traits: { $overlap: ["VOCALIZED", "ANNOTATED"] } } }]);
      specimen.expect(overlap.clauses[0].count).toBe(2);
      const silent = await call([{ pick: "all", where: { traits: { $none: ["VOCALIZED"] } } }]);
      specimen.expect(silent.clauses[0].count + 1).toBe(whole.clauses[0].count);

      const statuses = Object.fromEntries(whole.clauses[0].literals.map((row) => [row.slug, row.status]));
      specimen.expect(statuses.hello).toBe("KNOWN");
      specimen.expect(statuses.goodbye).toBe("LEARNING");
      specimen.expect(statuses.thanks).toBe("UNTOUCHED");
    });
  });

  specimen.it("/resolve picks are the domain repository's streams — byLastSignal, sample, byStrength", async () => {
    await scenario.scoped(async () => {
      const call = (set) => scenario.authedConn.call("/mode/game/dojo/resolve", { set });
      const missed = await call([{ pick: "byLastSignal" }]);
      specimen.expect(missed.clauses[0].literals.map((row) => row.slug)).toEqual(["goodbye"]);
      const succeeded = await call([{ pick: "byLastSignal", signals: ["SUCCESS", "MASTERY"] }]);
      specimen.expect(succeeded.clauses[0].literals.map((row) => row.slug)).toEqual(["hello"]);
      const known = await call([{ pick: "sample", status: ["KNOWN"] }]);
      specimen.expect(known.clauses[0].literals.map((row) => row.slug)).toEqual(["hello"]);
      const anyone = await call([{ pick: "sample" }]);
      specimen.expect(anyone.clauses[0].literals.length).toBeGreaterThan(known.clauses[0].literals.length);
      const weakest = await call([{ pick: "byStrength", limit: 1 }]);
      specimen.expect(weakest.clauses[0].literals.length).toBe(1);
    });
  });

  specimen.it("/count answers one count per query, pick-independent", async () => {
    await scenario.scoped(async () => {
      const { counts } = await scenario.authedConn.call("/mode/game/dojo/count", {
        wheres: [{}, { symbols: ["greeting"] }, { symbols: { $none: ["greeting"] } }, { traits: ["VOCALIZED"] }],
      });
      specimen.expect(counts.length).toBe(4);
      specimen.expect(counts[1] + counts[2]).toBe(counts[0]);
      specimen.expect(counts[3]).toBe(1);
    });
  });

  specimen.it("/resolve unions clauses in order, later clauses draw past earlier ones", async () => {
    await scenario.scoped(async () => {
      const preview = await scenario.authedConn.call("/mode/game/dojo/resolve", {
        set: [
          { pick: "all", where: { symbols: ["greeting"] } },
          { pick: "feed", limit: 4 },
          { pick: "authored", knowables: [{ known: "the kitchen", learning: "a cozinha" }] },
        ],
      });
      specimen.expect(preview.clauses.length).toBe(3);
      const first = preview.clauses[0].literals.map((row) => row.literal);
      const second = preview.clauses[1].literals.map((row) => row.literal);
      specimen.expect(second.some((id) => first.includes(id))).toBe(false);
      specimen.expect(preview.clauses[2].knowables[0].literal).toBeUndefined();
      specimen.expect(preview.total).toBe(
        preview.clauses.reduce((sum, entry) => sum + entry.literals.length + entry.knowables.length, 0),
      );
    });
  });

  specimen.it("/setup writes the declared state onto the buffer; /commission materializes it", async () => {
    await scenario.scoped(async () => {
      const bare = await scenario.mode.app.buffer({ thread: scenario.fixtures.thread.id });
      await scenario.daemon.entities.em.flush();

      const set = [{ pick: "feed", where: { symbols: ["greeting"] }, limit: 2 }];
      const setup = await scenario.authedConn.call("/mode/game/dojo/setup", {
        buffer: bare.id,
        set,
        gameplay: ["TYPE", "PICK"],
        streak: 2,
      });
      specimen.expect(setup.data.set).toEqual(set);
      specimen.expect(setup.data.streak).toBe(2);
      specimen.expect(setup.data.gameplay).toEqual(["TYPE", "PICK"]);
      specimen.expect(setup.symbols.map((symbol) => symbol.slug)).toEqual(["greeting"]);
      specimen.expect(setup.literals.length).toBe(0);

      const again = await scenario.authedConn.call("/mode/game/dojo/setup", {
        buffer: bare.id,
        gameplay: "TYPE",
      });
      specimen.expect(again.data.streak).toBeUndefined();
      specimen.expect(again.data.set).toEqual(set);

      const commissioned = await scenario.authedConn.call("/mode/game/dojo/commission", { buffer: bare.id });
      specimen.expect(commissioned.id).toBe(bare.id);
      specimen.expect(commissioned.literals.length).toBeGreaterThanOrEqual(1);
      specimen.expect(commissioned.literals.length).toBeLessThanOrEqual(2);

      const authored = await scenario.authedConn.call("/mode/game/dojo/setup", {
        buffer: bare.id,
        set: [{ pick: "authored", knowables: [{ ontology: "word", known: "the kitchen", learning: "a cozinha" }] }],
      });
      specimen.expect(authored.symbols.length).toBe(0);
      const rematerialized = await scenario.authedConn.call("/mode/game/dojo/commission", { buffer: bare.id });
      specimen.expect(rematerialized.literals.length).toBe(0);
      specimen.expect(rematerialized.data.knowables.length).toBe(1);
    });
  });
});
