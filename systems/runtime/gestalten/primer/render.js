import { Vector } from "@vivalence/typology";

const STAMPS = new Set(["createdAt", "updatedAt"]);
const json = (value) => JSON.stringify(value);
const property = ([key, schema]) => `${key} — ${schema.description ?? schema.$id ?? schema.type}${"examples" in schema ? ` · ${json(schema.examples[0])}` : ""}`;

export const entity = (factory) => {
  const schema = factory();
  return new Vector().open(
    { nature: `entity/${schema.$id.toLowerCase()}`, valence: schema.description, load: "lazy" },
    () => [
      `[${schema.$id}] ${schema.description}`,
      ...schema.allOf.flatMap((part) => Object.entries(part.properties).filter(([key]) => !STAMPS.has(key)).map(property)),
      ...Object.entries(factory.traits.properties ?? {}).map(property),
      `entity example · ${json(schema.examples[0])}`,
    ].join("\n"),
  );
};
