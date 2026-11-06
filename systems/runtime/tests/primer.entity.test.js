import { shape, specimen, v } from "@vivalence/typology";
import * as runtime from "@vivalence/runtime";

const { gestalten } = runtime;
const ENTITIES = ["thread", "buffer", "turn", "mode", "daemon", "user", "terminal", "note", "view", "file", "intent", "literal", "symbol", "activity"];
const BASE = ["id", "createdAt", "updatedAt"];

specimen.describe("gestalten.primer — one primer per entity, true to the schematic and to the mikro row", () => {
  for (const name of ENTITIES) {
    specimen.it(`${name}: the example is a row, every field and trait example passes its schema, the primer renders`, async () => {
      const factory = v[name];
      const schema = factory();
      const example = schema.examples[0];
      const mikro = runtime[`${name[0].toUpperCase()}${name.slice(1)}Schema`];
      const allowed = new Set([...Object.keys(mikro.meta.properties), ...BASE]);
      for (const key of Object.keys(example)) specimen.expect(allowed.has(key), `${name}.${key} is not a column`).toBe(true);
      for (const key of Object.keys(factory.schematic.own)) specimen.expect(key in example, `${name} example lacks ${key}`).toBe(true);
      for (const [key, field] of Object.entries(factory.schematic.own)) {
        if (key !== "trait" && "examples" in field) specimen.expect([...field.errors(field.examples[0])].map((error) => `${key}${error.instancePath} ${error.message}`)).toEqual([]);
      }
      for (const worn of example.traits ?? []) {
        const held = factory.traits.properties?.[worn];
        if (held && example.trait?.[worn] !== undefined) specimen.expect([...held.errors(example.trait[worn])].map((error) => `${worn}${error.instancePath} ${error.message}`)).toEqual([]);
      }
      for (const [trait, held] of Object.entries(factory.traits.properties ?? {})) {
        specimen.expect(typeof held.description, `${name} trait ${trait} has no meaning`).toBe("string");
        specimen.expect([...held.errors(held.examples[0])].map((error) => `${trait}${error.instancePath} ${error.message}`)).toEqual([]);
      }
      const text = await shape.primer.read(gestalten.primer[name], `entity/${name}`, {});
      specimen.expect(text.startsWith(`[${factory.$id}] ${schema.description}`)).toBe(true);
      specimen.expect(text.split("\n").at(-1).startsWith("entity example · {")).toBe(true);
    });
  }

  specimen.it("gestalten.primer.entities grafts the fourteen under entity/", () => {
    const strip = shape.strip(gestalten.primer.entities);
    specimen.expect(Object.keys(strip.branches.entity.branches)).toEqual(ENTITIES);
  });
});
