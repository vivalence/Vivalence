import { is } from "@vivalence/typology";

class CastError extends Error {} // aaah dementor attack

export const not = {
  object: (thing, expected) => {
    console.log({ not: "object", thing, expected });
    throw new CastError();
  },
  module: (thing, expected) => {
    console.log({ not: "module", thing, expected });
    throw new CastError();
  },
  viva: (thing, expected) => {
    console.log({ not: "viva", thing, expected });
    throw new CastError();
  },
};

export function viva(thing) {
  let viva;
  if (!is.object(thing)) not.object(thing, "viva");
  if (thing.manifest) viva = thing;
  else {
    if (is.fn(thing.default)) viva = thing.default();
    if (!viva && thing.default) viva = thing.default;
  }
  if (!viva) not.viva(thing);
  // is.viva()
  return viva;
}

export function runtime(thing) {
  let runtime = { ...viva(thing) };
  runtime.slug = runtime.manifest.slug;
  return runtime;
}
// const s = (key) => !viva[key] && viva.manifest[key] && (viva[key] = viva.manifest[key]); s("slug"); s("type");

export function lookup(thing) {
  // const queryA = "@vivalence/module/moduleA";
  // const queryB = { type: "module", slug: "moduleB", owner: "@vivalence" };
  // const queryC = { module: "@vivalence/module/moduleC" };
  // const queryD = {module: { type: "module", slug: "moduleD", owner: "@vivalence" },};
  // const queryE = {module: {manifest: { type: "module", slug: "moduleE", owner: "@vivalence" },},};

  if (is.string(thing)) {
    const [owner, type, ...rest] = thing.split("/");
    const [slug, version] = rest[0].split("@");
    return { owner, type, slug, version };
  }

  if (is.lookup(thing)) return thing;
  if (thing.module) return lookup(thing.module);
  if (thing.manifest) return lookup(thing.manifest);

  throw new CastError(`Invalid lookup query format: ${JSON.stringify(thing)}`);
}

export function array(thing) {
  return is.array(thing) ? thing : [thing];
}
