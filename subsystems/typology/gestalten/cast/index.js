import { is } from "@vivalence/typology";

export function lookup(query) {
  // const queryA = "@vivalence/module/moduleA";
  // const queryB = { type: "module", slug: "moduleB", owner: "@vivalence" };
  // const queryC = { module: "@vivalence/module/moduleC" };
  // const queryD = {module: { type: "module", slug: "moduleD", owner: "@vivalence" },};
  // const queryE = {module: {manifest: { type: "module", slug: "moduleE", owner: "@vivalence" },},};

  if (is.string(query)) {
    const [owner, type, ...rest] = query.split("/");
    const [slug, version] = rest[0].split("@");
    return { owner, type, slug, version };
  }

  if (is.lookup(query)) return query;
  if (query.module) return lookup(query.module);
  if (query.manifest) return lookup(query.manifest);

  throw new Error(`Invalid lookup query format: ${JSON.stringify(query)}`);
}

export function array(cast) {
  return is.array(cast) ? cast : [cast];
}
