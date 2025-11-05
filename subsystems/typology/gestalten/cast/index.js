export * from "./prototypes.js";
export * from "./primitives.js";
export * as prototypes from "./prototypes.js";
export * as primitives from "./primitives.js";

// Assertive conversion - throws on failure
import { is, not, prototypes } from "@vivalence/typology";

export function viva(thing) {
  let viva;
  if (is.fn(thing.default)) thing = thing.default();
  if (!is.defined(thing)) return not.defined(thing, "viva");
  if (!is.object(thing)) return not.object(thing, "viva");

  if (thing.manifest) viva = thing;

  if (!viva && thing.default) viva = thing.default;
  if (!viva) not.viva(thing);

  return viva;
}
export function url(thing) {
  console.log("should be url:", thing);
  return new prototypes.Url(thing);
}

export function runtime(thing) {
  let runtime = { ...viva(thing) };
  runtime.slug = runtime.manifest.slug;
  return runtime;
}
// const s = (key) => !viva[key] && viva.manifest[key] && (viva[key] = viva.manifest[key]); s("slug"); s("type");

export function lookup(thing) {
  if (!is.defined(thing)) not.defined();
  if (thing.remote) return lookup(thing.remote);

  // const queryA = "@vivalence/module/moduleA";
  // const queryB = { type: "module", slug: "moduleB", owner: "@vivalence" };
  // const queryC = { module: "@vivalence/module/moduleC" };
  // const queryD = {module: { type: "module", slug: "moduleD", owner: "@vivalence" },};
  // const queryE = {module: {manifest: { type: "module", slug: "moduleE", owner: "@vivalence" },},};
  // const queryF = Cake {} slug(runtime), service(query), runtime(owner), remote(module)

  if (is.string(thing)) {
    const [owner, type, ...rest] = thing.split("/");
    const [slug, version] = rest[0].split("@");
    return { owner, type, slug, version };
  }

  if (is.lookup(thing)) return thing;
  if (thing.module) return lookup(thing.module);
  if (thing.manifest) return lookup(thing.manifest);

  throw new Error(
    `[CAST ERROR] Invalid lookup query format: ${JSON.stringify(thing)}`,
  );
}

// class CastError extends Error {} // aaah dementor attack

// export const not = {
//   defined: (thing, expected) => {
//     // console.trace({ not: "defined", thing, expected });
//     throw new CastError();
//   },
//   object: (thing, expected) => {
//     // console.trace({ not: "object", thing, expected });
//     throw new CastError();
//   },
//   module: (thing, expected) => {
//     // console.trace({ not: "module", thing, expected });
//     throw new CastError();
//   },
//   viva: (thing, expected) => {
//     // console.trace({ not: "viva", thing, expected });
//     throw new CastError();
//   },
// };
// console.log({ not });
