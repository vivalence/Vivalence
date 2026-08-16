import { specimen } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";

import * as dojo from "../dojo.viva.js";
import * as types from "../types.js";
import * as fold from "../fold.js";

const emitted = (result) => result?.output?.buffer ?? [];

specimen.describe("dojo emitter", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await mountMode(dojo);
  });

  specimen.afterAll(async () => {
    await scenario?.orm?.close();
  });

  specimen.it("mode wired with raw routes and preset branches", () => {
    specimen.expect(scenario.mode.emit).toBeTruthy();
    for (const route of ["literals", "literal", "feed", "symbols", "knowables", "conjugations", "generate"]) {
      specimen.expect(scenario.mode.emit[route]).toBeTruthy();
    }
    for (const preset of Object.keys(types.PRESETS)) {
      specimen.expect(scenario.mode.emit[preset].feed).toBeTruthy();
      specimen.expect(scenario.mode.emit[preset].literals).toBeTruthy();
    }
  });

  specimen.it("emit.feed draws the full ontology and fills axes", async () => {
    await scenario.scoped(async () => {
      const result = await scenario.mode.emit.feed({ count: 10 });
      const buffers = emitted(result);
      specimen.expect(buffers.length).toBeGreaterThanOrEqual(1);
      const [buffer] = buffers;
      specimen.expect(buffer.data.gameplay).toBe("TYPE");
      specimen.expect(buffer.data.prompt).toBe("TEXT");
      specimen.expect(buffer.data.forgiving).toBe(true);
      const carried = buffer.literals.getItems().length + (buffer.data.knowables ?? []).length;
      specimen.expect(carried).toBeGreaterThanOrEqual(1);
    });
  });

  specimen.it("emit.feed resolves drawn conjugation rows into ONE table knowable each", async () => {
    await scenario.scoped(async () => {
      const result = await scenario.mode.emit.feed({ count: 20 });
      const [buffer] = emitted(result);
      const drawn = buffer.literals.getItems();
      specimen.expect(drawn.every((literal) => literal.ontology !== "conjugation")).toBe(true);
      const tables = (buffer.data.knowables ?? []).filter((knowable) => knowable.ontology === "conjugation");
      specimen.expect(tables.length).toBe(1);
      const [table] = tables;
      specimen.expect(table.known).toBe("to call");
      specimen.expect(table.learning).toBe("chamar");
      specimen.expect(table.context).toEqual({ tense: "presente", mood: "indicativo" });
      specimen.expect(table.tokens.map((token) => token.form)).toEqual(["chamo", "chamas"]);
      specimen.expect(table.tokens.map((token) => token.slot)).toEqual(["first.singular", "second.singular"]);
      specimen.expect(table.tokens[0].gloss).toBe("I call");
      specimen.expect(table.tokens[0].person).toBe("eu");
      specimen.expect(table.tokens[0].number).toBe("singular");
      specimen.expect(table.tokens.every((token) => token.literal)).toBe(true);
      specimen.expect(table.literal).toBeTruthy();
      const forms = drawn.filter((literal) => ["chamo.verb", "chamas.verb"].includes(literal.slug));
      specimen.expect(forms.length).toBe(0);
    });
  });

  specimen.it("a form drawn as a literal is a word carrying its own facets as context", async () => {
    await scenario.scoped(async () => {
      const [buffer] = emitted(
        await scenario.mode.emit.literals({ literals: [scenario.fixtures.chamo.id] }),
      );
      const [form] = buffer.literals.getItems();
      specimen.expect(form.ontology).not.toBe("conjugation");
      const knowable = fold.fromLiteral(form);
      specimen.expect(knowable.context).toEqual({ person: "first", number: "singular" });
      specimen.expect(fold.table(knowable)).toBe(false);
    });
  });

  specimen.it("emit.feed under AUDIO keeps only audible knowables", async () => {
    await scenario.scoped(async () => {
      const result = await scenario.mode.emit.feed({ count: 10, prompt: "AUDIO" });
      const buffers = emitted(result);
      specimen.expect(buffers.length).toBe(1);
      const [buffer] = buffers;
      const slugs = buffer.literals.getItems().map((literal) => literal.slug);
      specimen.expect(slugs).toEqual(["thanks"]);
      specimen.expect(buffer.data.knowables ?? []).toEqual([]);
    });
  });

  specimen.it("emit.write.literals folds the preset under caller input", async () => {
    await scenario.scoped(async () => {
      const result = await scenario.mode.emit.write.literals({
        literal: scenario.fixtures.hello,
        recall: "LEARNING",
      });
      const [buffer] = emitted(result);
      specimen.expect(buffer.data.gameplay).toBe("TYPE");
      specimen.expect(buffer.data.recall).toBe("LEARNING");
    });
  });

  specimen.it("emit.shadow.literals carries the preview axis, caller override wins", async () => {
    await scenario.scoped(async () => {
      const shadowed = emitted(
        await scenario.mode.emit.shadow.literals({ literal: scenario.fixtures.hello }),
      )[0];
      specimen.expect(shadowed.data.preview.speed.rate).toBe("NORMAL");

      const overridden = emitted(
        await scenario.mode.emit.shadow.literals({
          literal: scenario.fixtures.hello,
          preview: { speed: { rate: "SLOW" } },
        }),
      )[0];
      specimen.expect(overridden.data.preview.speed.rate).toBe("SLOW");
    });
  });

  specimen.it("emit.recognize.literal stamps a target and options", async () => {
    await scenario.scoped(async () => {
      const result = await scenario.mode.emit.recognize.literal({
        literal: scenario.fixtures.hello,
        recall: "LEARNING",
      });
      const [buffer] = emitted(result);
      specimen.expect(buffer.data.gameplay).toBe("PICK");
      specimen.expect(buffer.data.target).toBe(scenario.fixtures.hello.id);
      specimen.expect(buffer.literals.getItems().length).toBeGreaterThanOrEqual(2);
    });
  });

  specimen.it("emit.conjugations resolves paradigm rows drawn by where into tables", async () => {
    await scenario.scoped(async () => {
      const result = await scenario.mode.emit.conjugations({
        where: { uses: { $in: [scenario.fixtures.chamo.id] } },
        count: 1,
      });
      const [buffer] = emitted(result);
      const knowables = buffer.data.knowables;
      specimen.expect(knowables.length).toBe(1);
      specimen.expect(buffer.data.recall).toBe("LEARNING");
      specimen.expect(buffer.data.gameplay).toBe("CONJUGATE");
      const [table] = knowables;
      specimen.expect(table.ontology).toBe("conjugation");
      specimen.expect(table.tokens.length).toBe(2);
      specimen.expect(table.tokens[0].person).toBe("eu");
      specimen.expect(table.context.mood).toBe("indicativo");
    });
  });

  specimen.it("emit.conjugations lets the caller play the row as forms", async () => {
    await scenario.scoped(async () => {
      const [buffer] = emitted(
        await scenario.mode.emit.conjugations({ where: { uses: { $in: [scenario.fixtures.chamo.id] } }, count: 1, gameplay: "TYPE" }),
      );
      specimen.expect(buffer.data.gameplay).toBe("TYPE");
      specimen.expect(buffer.data.knowables[0].ontology).toBe("conjugation");
    });
  });

  specimen.it("emit.conjugate.feed is the table preset — conjugation rows only", async () => {
    await scenario.scoped(async () => {
      const [buffer] = emitted(await scenario.mode.emit.conjugate.feed({}));
      specimen.expect(buffer.data.set[0].where).toEqual({ ontology: "conjugation" });
      specimen.expect(buffer.data.gameplay).toBe("CONJUGATE");
      specimen.expect(buffer.data.recall).toBe("LEARNING");
      specimen.expect(buffer.literals.getItems().length).toBe(0);
      specimen.expect(buffer.data.knowables.every((knowable) => knowable.ontology === "conjugation")).toBe(true);
    });
  });

  specimen.it("emit.knowables passes caller-authored sets untouched", async () => {
    await scenario.scoped(async () => {
      const result = await scenario.mode.emit.knowables({
        knowables: [{ ontology: "word", known: "the bridge", learning: "a ponte" }],
        streak: 2,
      });
      const [buffer] = emitted(result);
      specimen.expect(buffer.data.knowables.length).toBe(1);
      specimen.expect(buffer.data.streak).toBe(2);
      specimen.expect(buffer.data.knowables[0].literal).toBeUndefined();
    });
  });

  specimen.it("emitted buffers carry their declared set beside the materialization", async () => {
    await scenario.scoped(async () => {
      const [buffer] = emitted(await scenario.mode.emit.symbols({ symbols: ["greeting"], count: 3 }));
      specimen.expect(buffer.data.set).toEqual([
        { pick: "feed", where: { symbols: ["greeting"] }, limit: 3 },
      ]);
      specimen.expect(buffer.symbols.getItems().map((symbol) => symbol.slug)).toEqual(["greeting"]);
      specimen.expect(buffer.literals.getItems().length).toBeGreaterThanOrEqual(1);
    });
  });

  specimen.it("aperture /resolve previews a declared set without a buffer", async () => {
    await scenario.scoped(async () => {
      const preview = await scenario.authedConn.call(`/mode/game/dojo/resolve`, {
        set: [{ pick: "feed", limit: 5 }],
      });
      specimen.expect(preview.clauses.length).toBe(1);
      specimen.expect(preview.total).toBeGreaterThanOrEqual(1);
      for (const knowable of [...preview.clauses[0].literals, ...preview.clauses[0].knowables]) {
        specimen.expect(knowable.known).toBeTruthy();
        specimen.expect(knowable.learning).toBeTruthy();
      }
    });
  });

  specimen.it("intents seeded", async () => {
    for (const intent of dojo.dataset.intent) {
      const found = await scenario.daemon.entities.intent.findOne({ slug: intent.slug });
      specimen.expect(found).toBeTruthy();
    }
  });
});
