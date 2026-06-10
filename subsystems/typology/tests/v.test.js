import { specimen, v } from "@vivalence/typology";

specimen.describe("v", () => {
  specimen.describe("primitives", () => {
    specimen.it("v.string()", () => {
      specimen.expect(v.string().check("hello")).toBe(true);
      specimen.expect(v.string().check(42)).toBe(false);
    });

    specimen.it("v.number()", () => {
      specimen.expect(v.number().check(3.14)).toBe(true);
      specimen.expect(v.number().check("nope")).toBe(false);
    });

    specimen.it("v.boolean()", () => {
      specimen.expect(v.boolean().check(true)).toBe(true);
      specimen.expect(v.boolean().check("true")).toBe(false);
    });

    specimen.it("v.integer()", () => {
      specimen.expect(v.integer().check(5)).toBe(true);
      specimen.expect(v.integer().check(3.14)).toBe(false);
    });

    specimen.it("v.const()", () => {
      specimen.expect(v.const("FAST").check("FAST")).toBe(true);
      specimen.expect(v.const("FAST").check("SLOW")).toBe(false);
    });

    specimen.it("v.object()", () => {
      const s = v.object({ name: v.string() });
      specimen.expect(s.check({ name: "hi" })).toBe(true);
      specimen.expect(s.check({ name: 42 })).toBe(false);
    });

    specimen.it("v.array()", () => {
      specimen.expect(v.array(v.string()).check(["a", "b"])).toBe(true);
      specimen.expect(v.array(v.string()).check([1, 2])).toBe(false);
    });

    specimen.it("v.union()", () => {
      const s = v.union([v.string(), v.number()]);
      specimen.expect(s.check("hi")).toBe(true);
      specimen.expect(s.check(42)).toBe(true);
      specimen.expect(s.check(true)).toBe(false);
    });

    specimen.it("v.intersect()", () => {
      const s = v.intersect([
        v.object({ a: v.string() }),
        v.object({ b: v.number() }),
      ]);
      specimen.expect(s.check({ a: "x", b: 1 })).toBe(true);
      specimen.expect(s.check({ a: "x" })).toBe(false);
    });

    specimen.it("v.record()", () => {
      const s = v.record(v.string(), v.number());
      specimen.expect(s.check({ x: 1, y: 2 })).toBe(true);
      specimen.expect(s.check({ x: "nope" })).toBe(false);
    });

    specimen.it("v.any()", () => {
      specimen.expect(v.any().check("anything")).toBe(true);
      specimen.expect(v.any().check(42)).toBe(true);
    });

    specimen.it("v.unknown()", () => {
      specimen.expect(v.unknown().check("anything")).toBe(true);
    });

    specimen.it("v.null()", () => {
      specimen.expect(v.null().check(null)).toBe(true);
      specimen.expect(v.null().check("nope")).toBe(false);
    });
  });

  specimen.describe("constraints via constructor opts", () => {
    specimen.it("string minLength", () => {
      const s = v.string({ minLength: 1 });
      specimen.expect(s.check("a")).toBe(true);
      specimen.expect(s.check("")).toBe(false);
    });

    specimen.it("string pattern", () => {
      const s = v.string({ pattern: "^[a-z]+$" });
      specimen.expect(s.check("abc")).toBe(true);
      specimen.expect(s.check("ABC")).toBe(false);
    });

    specimen.it("string format", () => {
      const s = v.string({ format: "date-time" });
      specimen.expect(s.check("2026-03-25T00:00:00Z")).toBe(true);
    });

    specimen.it("number minimum/maximum", () => {
      const s = v.number({ minimum: 0, maximum: 100 });
      specimen.expect(s.check(50)).toBe(true);
      specimen.expect(s.check(-1)).toBe(false);
      specimen.expect(s.check(101)).toBe(false);
    });

    specimen.it("integer multipleOf", () => {
      const s = v.integer({ multipleOf: 3 });
      specimen.expect(s.check(9)).toBe(true);
      specimen.expect(s.check(10)).toBe(false);
    });

    specimen.it("array minItems/maxItems", () => {
      const s = v.array(v.string(), { minItems: 1, maxItems: 3 });
      specimen.expect(s.check(["a"])).toBe(true);
      specimen.expect(s.check([])).toBe(false);
      specimen.expect(s.check(["a", "b", "c", "d"])).toBe(false);
    });

    specimen.it("object additionalProperties", () => {
      const strict = v.object({ name: v.string() }, { additionalProperties: false });
      specimen.expect(strict.check({ name: "hi" })).toBe(true);
      specimen.expect(strict.check({ name: "hi", extra: true })).toBe(false);
    });

    specimen.it("constraints + chain methods compose", () => {
      const s = v.string({ minLength: 1 }).default("hello").desc("A name");
      specimen.expect(s.check("a")).toBe(true);
      specimen.expect(s.check("")).toBe(false);
      specimen.expect(s.default).toBe("hello");
      specimen.expect(s.description).toBe("A name");
    });
  });

  specimen.describe(".desc()", () => {
    specimen.it("sets description", () => {
      specimen.expect(v.string().desc("A name").description).toBe("A name");
    });

    specimen.it("does not mutate original", () => {
      const a = v.string();
      const b = a.desc("tagged");
      specimen.expect(a.description).toBe(undefined);
      specimen.expect(b.description).toBe("tagged");
    });
  });

  specimen.describe(".default()", () => {
    specimen.it("sets default value", () => {
      specimen.expect(v.string().default("LEARNING").default).toBe("LEARNING");
    });

    specimen.it("reading .default after setting returns value not setter", () => {
      const s = v.number().default(0);
      specimen.expect(s.default).toBe(0);
      specimen.expect(typeof s.default).toBe("number");
    });
  });

  specimen.describe(".optional()", () => {
    specimen.it("marks property optional in object", () => {
      const s = v.object({ name: v.string().optional() });
      specimen.expect(s.check({})).toBe(true);
      specimen.expect(s.check({ name: "hello" })).toBe(true);
    });

    specimen.it("required property rejects omission", () => {
      specimen.expect(v.object({ name: v.string() }).check({})).toBe(false);
    });
  });

  specimen.describe(".cast()", () => {
    specimen.it("applies defaults and returns value", () => {
      const s = v.object({ recall: v.string().default("LEARNING") });
      const value = s.cast({});
      specimen.expect(value.recall).toBe("LEARNING");
    });

    specimen.it("retains provided values", () => {
      const s = v.object({ recall: v.string().default("LEARNING") });
      const value = s.cast({ recall: "KNOWN" });
      specimen.expect(value.recall).toBe("KNOWN");
    });

    specimen.it("returns the same object (mutates in place)", () => {
      const s = v.object({ x: v.number().default(0) });
      const input = {};
      const output = s.cast(input);
      specimen.expect(input).toBe(output);
    });
  });

  specimen.describe(".check()", () => {
    specimen.it("validates values", () => {
      const s = v.string();
      specimen.expect(s.check("hello")).toBe(true);
      specimen.expect(s.check(42)).toBe(false);
    });
  });

  specimen.describe(".create()", () => {
    specimen.it("instantiates from defaults", () => {
      const s = v.object({
        name: v.string().default("unnamed"),
        count: v.integer().default(0),
      });
      const value = s.create();
      specimen.expect(value.name).toBe("unnamed");
      specimen.expect(value.count).toBe(0);
    });
  });

  specimen.describe(".clean()", () => {
    specimen.it("strips unknown properties", () => {
      const s = v.object({ name: v.string() });
      const value = s.clean({ name: "hi", extra: true, junk: 42 });
      specimen.expect(value.name).toBe("hi");
      specimen.expect(value.extra).toBe(undefined);
      specimen.expect(value.junk).toBe(undefined);
    });
  });

  specimen.describe(".errors()", () => {
    specimen.it("returns error iterator for invalid value", () => {
      const s = v.object({ name: v.string(), age: v.number() });
      const errs = [...s.errors({ name: 42, age: "wrong" })];
      specimen.expect(errs.length > 0).toBe(true);
    });

    specimen.it("returns empty for valid value", () => {
      const s = v.string();
      const errs = [...s.errors("hello")];
      specimen.expect(errs.length).toBe(0);
    });
  });

  specimen.describe(".compile()", () => {
    specimen.it("returns optimized validator", () => {
      const s = v.object({ name: v.string() });
      const compiled = s.compile();
      specimen.expect(compiled.Check({ name: "hi" })).toBe(true);
      specimen.expect(compiled.Check({ name: 42 })).toBe(false);
    });
  });

  specimen.describe("chaining", () => {
    specimen.it(".default().desc() chains", () => {
      const s = v.string().default("X").desc("label");
      specimen.expect(s.default).toBe("X");
      specimen.expect(s.description).toBe("label");
    });

    specimen.it(".desc().default() order independent", () => {
      const s = v.string().desc("label").default("X");
      specimen.expect(s.default).toBe("X");
      specimen.expect(s.description).toBe("label");
    });

    specimen.it("full chain in object context", () => {
      const schema = v.object({
        count: v.number().default(0).desc("count").optional(),
      });
      specimen.expect(schema.check({})).toBe(true);
      specimen.expect(schema.check({ count: 42 })).toBe(true);
      specimen.expect(schema.cast({}).count).toBe(0);
    });
  });

  specimen.describe("interop", () => {
    specimen.it("mixed primitive props", () => {
      const s = v.object({
        name: v.string({ minLength: 1 }),
        age: v.number().desc("years"),
        tags: v.array(v.string()),
      });
      specimen.expect(s.check({ name: "finn", age: 30, tags: ["a"] })).toBe(true);
      specimen.expect(s.check({ name: "", age: 30, tags: ["a"] })).toBe(false);
    });

    specimen.it("v.array(v.object()) nesting", () => {
      const s = v.array(v.object({ id: v.string() }));
      specimen.expect(s.check([{ id: "1" }, { id: "2" }])).toBe(true);
    });

    specimen.it("spread produces clean schema", () => {
      const s = v.string().default("X").desc("label");
      const plain = { ...s };
      specimen.expect(plain.default).toBe("X");
      specimen.expect(plain.description).toBe("label");
      specimen.expect(plain.desc).toBe(undefined);
      specimen.expect(plain.optional).toBe(undefined);
      specimen.expect(plain.check).toBe(undefined);
      specimen.expect(plain.create).toBe(undefined);
    });

    specimen.it("JSON.stringify omits proxy methods", () => {
      const s = v.string().default("X").desc("label");
      const json = JSON.parse(JSON.stringify(s));
      specimen.expect(json.desc).toBe(undefined);
      specimen.expect(json.check).toBe(undefined);
      specimen.expect(json.defaults).toBe(undefined);
    });
  });

  specimen.describe("static value operations", () => {
    specimen.it("v.equal()", () => {
      specimen.expect(v.equal({ a: 1 }, { a: 1 })).toBe(true);
      specimen.expect(v.equal({ a: 1 }, { a: 2 })).toBe(false);
    });

    specimen.it("v.clone()", () => {
      const original = { a: { b: 1 } };
      const cloned = v.clone(original);
      specimen.expect(v.equal(original, cloned)).toBe(true);
      specimen.expect(original).not.toBe(cloned);
      specimen.expect(original.a).not.toBe(cloned.a);
    });

    specimen.it("v.diff() + v.patch()", () => {
      const a = { name: "old", count: 1 };
      const b = { name: "new", count: 1 };
      const edits = v.diff(a, b);
      const patched = v.patch(v.clone(a), edits);
      specimen.expect(v.equal(patched, b)).toBe(true);
    });
  });

  specimen.describe("$id and $ref", () => {
    specimen.it(".$id() sets schema $id", () => {
      const s = v.object({ name: v.string() }).$id("Person");
      specimen.expect(s.$id).toBe("Person");
    });

    specimen.it("v.$ref() references a named schema", () => {
      const Person = v.object({ name: v.string() }).$id("Person");
      const Team = v.object({ lead: v.$ref(Person) });
      specimen.expect(Team.check({ lead: { name: "finn" } })).toBe(true);
    });

    specimen.it(".$id() composes with other chains", () => {
      const s = v.object({ x: v.number() }).$id("Point").desc("A 1D point");
      specimen.expect(s.$id).toBe("Point");
      specimen.expect(s.description).toBe("A 1D point");
    });
  });

  specimen.describe("v.rel()", () => {
    specimen.it("accepts ID string", () => {
      specimen.expect(v.rel(v.mode()).check("mode-123")).toBe(true);
    });

    specimen.it("accepts populated entity", () => {
      specimen.expect(v.rel(v.mode()).check({ slug: "flashcard", type: "game" })).toBe(true);
    });

    specimen.it("rejects non-rel values", () => {
      specimen.expect(v.rel(v.mode()).check(42)).toBe(false);
    });

    specimen.it("chains with .optional()", () => {
      const s = v.object({ thread: v.rel(v.thread()).optional() });
      specimen.expect(s.check({})).toBe(true);
      specimen.expect(s.check({ thread: "thread-1" })).toBe(true);
    });
  });

  specimen.describe("v.buffer()", () => {
    specimen.it("produces valid Buffer schema", () => {
      const schema = v.buffer({
        data: {
          recall: v.string().default("LEARNING").desc("direction"),
        },
        literals: v.array(v.literal()).desc("targets"),
      });
      specimen.expect(schema.check({
        mode: "m",
        data: { recall: "KNOWN" },
        literals: [{ slug: "olá" }],
      })).toBe(true);
    });

    specimen.it(".cast() works on buffer schema", () => {
      const schema = v.buffer({
        data: {
          recall: v.string().default("LEARNING"),
          gameplay: v.string().default("visual"),
        },
      });
      const value = schema.cast({ mode: "m", data: {} });
      specimen.expect(value.data.recall).toBe("LEARNING");
      specimen.expect(value.data.gameplay).toBe("visual");
    });

    specimen.it("narrowing overrides data fields", () => {
      const schema = v.buffer({
        data: { recall: v.string().default("LEARNING") },
      });
      const value = schema.cast({ data: {} });
      specimen.expect(value.data.recall).toBe("LEARNING");
    });
  });

  specimen.describe("v.literal()", () => {
    specimen.it("base schema validates a literal", () => {
      specimen.expect(v.literal().check({
        trait: { TRANSLATED: { learning: "olá", known: "hello" } },
      })).toBe(true);
    });

    specimen.it("narrowed schema validates trait shape", () => {
      const schema = v.literal({
        trait: {
          TRANSLATED: v.object({ learning: v.string(), known: v.string() }),
        },
      });
      specimen.expect(schema.check({
        trait: { TRANSLATED: { learning: "olá", known: "hello" } },
      })).toBe(true);
    });

    specimen.it("narrowed schema rejects wrong trait shape", () => {
      const schema = v.literal({
        trait: {
          TRANSLATED: v.object({ learning: v.string(), known: v.string() }),
        },
      });
      specimen.expect(schema.check({
        trait: { TRANSLATED: { learning: 42, known: "hello" } },
      })).toBe(false);
    });

    specimen.it("accepts symbols as refs", () => {
      specimen.expect(v.literal().check({
        trait: {},
        symbols: [{ slug: "word.noun" }, { slug: "word.verb" }],
      })).toBe(true);
    });
  });

  specimen.describe("v.symbol()", () => {
    specimen.it("base schema validates a symbol", () => {
      specimen.expect(v.symbol().check({
        trait: { STRUCTURAL: { pos: "noun" } },
      })).toBe(true);
    });

    specimen.it("narrowed schema validates trait shape", () => {
      const schema = v.symbol({
        trait: {
          STRUCTURAL: v.object({ pos: v.string() }),
        },
      });
      specimen.expect(schema.check({
        slug: "word.noun",
        trait: { STRUCTURAL: { pos: "noun" } },
      })).toBe(true);
    });
  });

  specimen.describe("v.mode()", () => {
    specimen.it("base schema validates a mode", () => {
      specimen.expect(v.mode().check({
        slug: "flashcard",
        type: "game",
      })).toBe(true);
    });

    specimen.it("narrowed schema accepts intents", () => {
      const schema = v.mode({
        intents: v.array(v.intent()),
      });
      specimen.expect(schema.check({
        intents: [{ slug: "learn" }, { slug: "review" }],
      })).toBe(true);
    });
  });

  specimen.describe("v.intent()", () => {
    specimen.it("base schema validates an intent", () => {
      specimen.expect(v.intent().check({
        trait: {},
        mode: "mode-id",
      })).toBe(true);
    });

    specimen.it("narrowed schema validates trait shape", () => {
      const schema = v.intent({
        trait: {
          MASKED: v.object({ limit: v.number() }),
        },
      });
      specimen.expect(schema.check({
        trait: { MASKED: { limit: 4 } },
        mode: "mode-id",
      })).toBe(true);
    });
  });

  specimen.describe("v.thread()", () => {
    specimen.it("base schema validates a thread", () => {
      specimen.expect(v.thread().check({
        user: "user-id",
        mode: "mode-id",
        trait: {},
      })).toBe(true);
    });

    specimen.it("narrowed schema validates trait shape", () => {
      const schema = v.thread({
        trait: {
          progress: v.object({ level: v.integer() }),
        },
      });
      specimen.expect(schema.check({
        user: "u",
        mode: "m",
        trait: { progress: { level: 3 } },
      })).toBe(true);
    });

    specimen.it("accepts optional intent ref", () => {
      specimen.expect(v.thread().check({
        user: "u",
        mode: "m",
        trait: {},
        intent: "intent-id",
      })).toBe(true);
    });
  });
});
