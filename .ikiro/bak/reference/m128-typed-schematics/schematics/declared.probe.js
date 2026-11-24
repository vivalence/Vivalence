import "@vivalence/typology";

const root = new URL("../../../../subsystems/typology/schematics/", import.meta.url);
const files = JSON.parse(Deno.readTextFileSync(new URL("./files.json", import.meta.url)));

const walk = (schema, at, seen, found) => {
  if (schema === null || typeof schema !== "object" || seen.has(schema)) return found;
  seen.add(schema);
  const keys = Object.keys(schema).filter((key) => !["description", "title", "examples", "default", "$id", "group"].includes(key));
  if (schema.anyOf) schema.anyOf.forEach((variant) => walk(variant, at, seen, found));
  if (schema.allOf) schema.allOf.forEach((part) => walk(part, at, seen, found));
  if (schema.type === "object") {
    Object.entries(schema.properties ?? {}).forEach(([key, held]) => walk(held, `${at}.${key}`, seen, found));
    Object.values(schema.patternProperties ?? {}).forEach((held) => walk(held, `${at}.\${string}`, seen, found));
    if (schema.additionalProperties === true) found.add(`${at}.\${string} unknown`);
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      walk(schema.additionalProperties, `${at}.\${string}`, seen, found);
    }
  }
  if (schema.type === "array") {
    [schema.items, ...(schema.prefixItems ?? [])].flat().forEach((held) => held && walk(held, `${at}[]`, seen, found));
  }
  if (!schema.type && !schema.anyOf && !schema.allOf && !("const" in schema) && !schema.enum && !schema.$ref) {
    found.add(`${at} ${keys.length ? `unknown {${keys.join(",")}}` : "unknown"}`);
  }
  return found;
};

const declared = {};
const keys = {};
for (const file of files) {
  const module = await import(new URL(file, root).href);
  for (const [name, held] of Object.entries(module)) {
    if (held === null || typeof held !== "object" || typeof held.cast !== "function") continue;
    keys[`${file} ${name}`] = Object.keys(held.properties ?? {});
    declared[`${file} ${name}`] = [...walk(JSON.parse(JSON.stringify(held)), "", new Set(), new Set())].sort();
  }
}
Deno.writeTextFileSync(new URL("./keys.json", import.meta.url), JSON.stringify(keys, null, 2));
Deno.writeTextFileSync(new URL("./declared.json", import.meta.url), JSON.stringify(declared, null, 2));
console.log(`schematics ${Object.keys(declared).length} · with a declared unknown ${Object.values(declared).filter((paths) => paths.length).length}`);
