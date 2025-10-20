import { is, prototypes } from "@vivalence/typology";

export const fromm = {
  import: { path: (thing) => ({}) },
};

// // const join = (...segments) => {
// //   const path = segments.filter(Boolean).join("/").replace(/\/+/g, "/");
// //   const withLeading = path.startsWith("/") ? path : "/" + path;
// //   return withLeading.replace(/\/$/, "") || "/";
// // };

// // const fromFile = (url) => {
// //   // TODO: apply trace of 'file:/'
// // };

export function path(...things) {
  //
}
// *invertFromm('path', path)

path.url = function pathFrommUrl(url) {
  const [file, ...dir] = url
    .replace(/^file:\/\//, "")
    .split("/")
    .reverse();
  return new prototypes.Path(file) //
    .from(new prototypes.Path(dir.reverse().join("/")));
};
path.params = function pathFrommParams(params) {
  const path = new Path();
  while (params[path.depth]) {
    path.stick(params[path.depth]);
  }
  return path;
};

export function array(thing) {
  if (is.object) return Object.entries(thing);
  console.log("failed as.array(thing) case:", thing);
  // not.array(thing)
  return thing;
}
