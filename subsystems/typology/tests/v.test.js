import { specimen, v } from "@vivalence/typology";

specimen.describe("v", () => {
  specimen.it("a schema judges every shape", () => {
    specimen.expect(v.string().check("hello")).toBe(true);
    specimen.expect(v.string().check(42)).toBe(false);
    specimen.expect(v.number().check(3.14)).toBe(true);
    specimen.expect(v.number().check("nope")).toBe(false);
    specimen.expect(v.boolean().check(true)).toBe(true);
    specimen.expect(v.boolean().check("true")).toBe(false);
    specimen.expect(v.integer().check(5)).toBe(true);
    specimen.expect(v.integer().check(3.14)).toBe(false);
    specimen.expect(v.const("FAST").check("FAST")).toBe(true);
    specimen.expect(v.const("FAST").check("SLOW")).toBe(false);
    specimen.expect(v.null().check(null)).toBe(true);
    specimen.expect(v.null().check("nope")).toBe(false);
    specimen.expect(v.any().check("anything")).toBe(true);
    specimen.expect(v.any().check(42)).toBe(true);
    specimen.expect(v.unknown().check("anything")).toBe(true);

    specimen.expect(v.object({ name: v.string() }).check({ name: "hi" })).toBe(true);
    specimen.expect(v.object({ name: v.string() }).check({ name: 42 })).toBe(false);
    specimen.expect(v.array(v.string()).check(["a", "b"])).toBe(true);
    specimen.expect(v.array(v.string()).check([1, 2])).toBe(false);
    specimen.expect(v.array(v.object({ id: v.string() })).check([{ id: "1" }, { id: "2" }])).toBe(true);

    const either = v.union([v.string(), v.number()]);
    specimen.expect(either.check("hi")).toBe(true);
    specimen.expect(either.check(42)).toBe(true);
    specimen.expect(either.check(true)).toBe(false);

    const both = v.intersect([v.object({ a: v.string() }), v.object({ b: v.number() })]);
    specimen.expect(both.check({ a: "x", b: 1 })).toBe(true);
    specimen.expect(both.check({ a: "x" })).toBe(false);

    const mapped = v.record(v.string(), v.number());
    specimen.expect(mapped.check({ x: 1, y: 2 })).toBe(true);
    specimen.expect(mapped.check({ x: "nope" })).toBe(false);
  });

  specimen.it("constraints ride the constructor", () => {
    specimen.expect(v.string({ minLength: 1 }).check("a")).toBe(true);
    specimen.expect(v.string({ minLength: 1 }).check("")).toBe(false);
    specimen.expect(v.string({ pattern: "^[a-z]+$" }).check("abc")).toBe(true);
    specimen.expect(v.string({ pattern: "^[a-z]+$" }).check("ABC")).toBe(false);
    specimen.expect(v.string({ format: "date-time" }).check("2026-03-25T00:00:00Z")).toBe(true);

    const bounded = v.number({ minimum: 0, maximum: 100 });
    specimen.expect(bounded.check(50)).toBe(true);
    specimen.expect(bounded.check(-1)).toBe(false);
    specimen.expect(bounded.check(101)).toBe(false);
    specimen.expect(v.integer({ multipleOf: 3 }).check(9)).toBe(true);
    specimen.expect(v.integer({ multipleOf: 3 }).check(10)).toBe(false);

    const sized = v.array(v.string(), { minItems: 1, maxItems: 3 });
    specimen.expect(sized.check(["a"])).toBe(true);
    specimen.expect(sized.check([])).toBe(false);
    specimen.expect(sized.check(["a", "b", "c", "d"])).toBe(false);

    const strict = v.object({ name: v.string() }, { additionalProperties: false });
    specimen.expect(strict.check({ name: "hi" })).toBe(true);
    specimen.expect(strict.check({ name: "hi", extra: true })).toBe(false);

    const composed = v.string({ minLength: 1 }).default("hello").desc("A name");
    specimen.expect(composed.check("a")).toBe(true);
    specimen.expect(composed.check("")).toBe(false);
    specimen.expect(composed.default).toBe("hello");
    specimen.expect(composed.description).toBe("A name");

    const mixed = v.object({
      name: v.string({ minLength: 1 }),
      age: v.number().desc("years"),
      tags: v.array(v.string()),
    });
    specimen.expect(mixed.check({ name: "finn", age: 30, tags: ["a"] })).toBe(true);
    specimen.expect(mixed.check({ name: "", age: 30, tags: ["a"] })).toBe(false);
  });

  specimen.it("a chain decorates without mutating", () => {
    const bare = v.string();
    const tagged = bare.desc("tagged");
    specimen.expect(bare.description).toBe(undefined);
    specimen.expect(tagged.description).toBe("tagged");

    specimen.expect(v.string().default("LEARNING").default).toBe("LEARNING");
    specimen.expect(typeof v.number().default(0).default).toBe("number");

    specimen.expect(v.string().default("X").desc("label").default).toBe("X");
    specimen.expect(v.string().desc("label").default("X").description).toBe("label");

    const optional = v.object({ name: v.string().optional() });
    specimen.expect(optional.check({})).toBe(true);
    specimen.expect(optional.check({ name: "hello" })).toBe(true);
    specimen.expect(v.object({ name: v.string() }).check({})).toBe(false);

    const full = v.object({ count: v.number().default(0).desc("count").optional() });
    specimen.expect(full.check({})).toBe(true);
    specimen.expect(full.check({ count: 42 })).toBe(true);
    specimen.expect(full.cast({}).count).toBe(0);

    const named = v.object({ name: v.string() }).$id("Person");
    specimen.expect(named.$id).toBe("Person");
    specimen.expect(v.object({ lead: v.$ref(named) }).check({ lead: { name: "finn" } })).toBe(true);

    const point = v.object({ x: v.number() }).$id("Point").desc("A 1D point");
    specimen.expect(point.$id).toBe("Point");
    specimen.expect(point.description).toBe("A 1D point");
  });

  specimen.it("cast fills, create births, clean strips", () => {
    const recall = v.object({ recall: v.string().default("LEARNING") });
    specimen.expect(recall.cast({}).recall).toBe("LEARNING");
    specimen.expect(recall.cast({ recall: "KNOWN" }).recall).toBe("KNOWN");

    const input = {};
    specimen.expect(v.object({ x: v.number().default(0) }).cast(input)).toBe(input);

    const born = v.object({ name: v.string().default("unnamed"), count: v.integer().default(0) }).create();
    specimen.expect(born.name).toBe("unnamed");
    specimen.expect(born.count).toBe(0);

    const cleaned = v.object({ name: v.string() }).clean({ name: "hi", extra: true, junk: 42 });
    specimen.expect(cleaned.name).toBe("hi");
    specimen.expect(cleaned.extra).toBe(undefined);
    specimen.expect(cleaned.junk).toBe(undefined);

    const suspect = v.object({ name: v.string(), age: v.number() });
    specimen.expect([...suspect.errors({ name: 42, age: "wrong" })].length > 0).toBe(true);
    specimen.expect([...v.string().errors("hello")].length).toBe(0);

    const compiled = v.object({ name: v.string() }).compile();
    specimen.expect(compiled.Check({ name: "hi" })).toBe(true);
    specimen.expect(compiled.Check({ name: 42 })).toBe(false);
  });

  specimen.it("a schema survives the wire", () => {
    const dressed = v.string().default("X").desc("label");

    const spread = { ...dressed };
    specimen.expect(spread.default).toBe("X");
    specimen.expect(spread.description).toBe("label");
    specimen.expect(spread.desc).toBe(undefined);
    specimen.expect(spread.optional).toBe(undefined);
    specimen.expect(spread.check).toBe(undefined);
    specimen.expect(spread.create).toBe(undefined);

    const serialized = JSON.parse(JSON.stringify(dressed));
    specimen.expect(serialized.desc).toBe(undefined);
    specimen.expect(serialized.check).toBe(undefined);
    specimen.expect(serialized.defaults).toBe(undefined);
  });

  specimen.it("values compare, clone, diff and patch", () => {
    specimen.expect(v.equal({ a: 1 }, { a: 1 })).toBe(true);
    specimen.expect(v.equal({ a: 1 }, { a: 2 })).toBe(false);

    const original = { a: { b: 1 } };
    const cloned = v.clone(original);
    specimen.expect(v.equal(original, cloned)).toBe(true);
    specimen.expect(original).not.toBe(cloned);
    specimen.expect(original.a).not.toBe(cloned.a);

    const before = { name: "old", count: 1 };
    const after = { name: "new", count: 1 };
    const patched = v.patch(v.clone(before), v.diff(before, after));
    specimen.expect(v.equal(patched, after)).toBe(true);
  });

  specimen.it("a relation is identity, not value", () => {
    specimen.expect(v.rel(v.mode()).check("mode-123")).toBe(true);
    specimen.expect(v.rel(v.mode()).check({ slug: "flashcard", type: "game" })).toBe(true);
    specimen.expect(v.rel(v.mode()).check(42)).toBe(false);

    const chained = v.object({ thread: v.rel(v.thread()).optional() });
    specimen.expect(chained.check({})).toBe(true);
    specimen.expect(chained.check({ thread: "thread-1" })).toBe(true);

    class Collection {
      constructor() { this.items = []; }
      getItems() { return this.items; }
      add(item) { this.items.push(item); }
    }
    const symbols = new Collection();
    symbols.add({ id: "s1" });
    const entity = { id: "lit-1", slug: "bom", symbols };
    const out = v.object({ literals: v.array(v.rel(v.literal())) }).cast({ literals: [entity] });
    specimen.expect(out.literals[0].symbols).toBe(symbols);
    specimen.expect(out.literals[0].symbols instanceof Collection).toBe(true);
    specimen.expect(out.literals[0].id).toBe("lit-1");
  });

  specimen.it("a slug is a scalar builder", () => {
    specimen.expect(v.slug().check("bom-dia")).toBe(true);
    specimen.expect(v.slug().check("Bom Dia")).toBe(false);
    specimen.expect(v.slug({ minLength: 3 }).check("ab")).toBe(false);
    specimen.expect(v.slug({ minLength: 3 }).check("abc")).toBe(true);
    specimen.expect(v.slug().description).toBe("URL-compliant identifier");
    specimen.expect(v.array(v.scalars.Slug).check(["bom", "dia"])).toBe(true);
  });

  specimen.it("a buffer schema casts its data", () => {
    const schema = v.buffer({
      data: { recall: v.string().default("LEARNING").desc("direction") },
      literals: v.array(v.literal()).desc("targets"),
    });
    specimen.expect(schema.check({ mode: "m", data: { recall: "KNOWN" }, literals: [{ slug: "olá" }] })).toBe(true);

    const filled = v.buffer({
      data: { recall: v.string().default("LEARNING"), gameplay: v.string().default("visual") },
    }).cast({ mode: "m", data: {} });
    specimen.expect(filled.data.recall).toBe("LEARNING");
    specimen.expect(filled.data.gameplay).toBe("visual");

    specimen.expect(v.buffer({ data: { recall: v.string().default("LEARNING") } }).cast({ data: {} }).data.recall).toBe("LEARNING");
  });

  specimen.it("an entity schema narrows per trait", () => {
    specimen.expect(v.literal().check({ trait: { TRANSLATED: { learning: "olá", known: "hello" } } })).toBe(true);
    specimen.expect(v.literal().check({ trait: {}, symbols: [{ slug: "word.noun" }, { slug: "word.verb" }] })).toBe(true);

    const translated = v.literal({
      trait: { TRANSLATED: v.object({ learning: v.string(), known: v.string() }) },
    });
    specimen.expect(translated.check({ trait: { TRANSLATED: { learning: "olá", known: "hello" } } })).toBe(true);
    specimen.expect(translated.check({ trait: { TRANSLATED: { learning: 42, known: "hello" } } })).toBe(false);

    specimen.expect(v.symbol().check({ trait: { STRUCTURAL: { pos: "noun" } } })).toBe(true);
    specimen.expect(v.symbol({ trait: { STRUCTURAL: v.object({ pos: v.string() }) } })
      .check({ slug: "word.noun", trait: { STRUCTURAL: { pos: "noun" } } })).toBe(true);

    specimen.expect(v.mode().check({ slug: "flashcard", type: "game" })).toBe(true);
    specimen.expect(v.mode({ intents: v.array(v.intent()) })
      .check({ intents: [{ slug: "learn" }, { slug: "review" }] })).toBe(true);

    specimen.expect(v.intent().check({ trait: {}, mode: "mode-id" })).toBe(true);
    specimen.expect(v.intent({ trait: { MASKED: v.object({ limit: v.number() }) } })
      .check({ trait: { MASKED: { limit: 4 } }, mode: "mode-id" })).toBe(true);

    specimen.expect(v.thread().check({ user: "user-id", mode: "mode-id", trait: {} })).toBe(true);
    specimen.expect(v.thread().check({ user: "u", mode: "m", trait: {}, intent: "intent-id" })).toBe(true);
    specimen.expect(v.thread({ trait: { progress: v.object({ level: v.integer() }) } })
      .check({ user: "u", mode: "m", trait: { progress: { level: 3 } } })).toBe(true);
  });
});
