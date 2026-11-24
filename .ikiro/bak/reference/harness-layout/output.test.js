import { specimen, v, Vector, steer } from "@vivalence/typology";

const fields = (schema) => Object.entries(schema?.properties ?? {});
const typed = (schema) =>
  Object.fromEntries(
    fields(schema).map(([key, field]) => [(schema.required ?? []).includes(key) ? key : `${key}?`, field.type ?? "any"]),
  );
const side = (schema) => schema && { ...typed(schema), ...(schema.examples && { examples: schema.examples }) };

const tools = new Vector().open(
  {
    nature: "/entity/count",
    valence: "Count matching entities without loading them.",
    input: v
      .object({ entity: v.string(), where: v.record(v.string(), v.unknown()).optional() })
      .example({ entity: "buffer", where: { thread: "01a09010-13aa-778b-bce7-19c38f835337" } }),
    output: v.object({ count: v.integer() }).example({ count: 3 }),
  },
  () => ({ output: { count: 3 } }),
);

specimen.describe("an outline entry with both sides declared", () => {
  specimen.it("input and output: names, types, examples", () => {
    const [{ pattern }] = steer.trie.leaves(tools);
    const entry = { valence: pattern.valence, input: side(pattern.input), output: side(pattern.output) };
    console.log(JSON.stringify({ "entity/count": entry }, null, 2));
  });
});
