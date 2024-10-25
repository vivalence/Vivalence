import { deepClone } from "@vivalence/shared";
import register from "./lib.js";

async function init({ root }) {
  const registry = await register.init({ root });
}

async function load(query) {
  if (typeof query !== "string" && query.manifest) return query;
  return deepClone(await register.lookup(query));
}

async function loadMany(many) {
  return await Promise.all(many.map((query) => load(query)));
}

async function verify({ manifest, modules }) {
  // verify module
  // check compatibility and completeness.
}

async function build({ manifest, modules }) {
  // build whole module.
  // get passed module, get recipie from manifest.type, build and verify
}

export default { init, load, loadMany, build };
